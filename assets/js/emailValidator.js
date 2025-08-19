/**
 * Email Validator Module
 * Handles all email validation logic on the client side
 * Used on https://emaillistcleaner.org/
 * Copyright 2025 Great Software Company
 * License: MIT
 */
import { roleBasedEmails } from './roleBasedEmails.js';
import { disposableDomains } from './disposableDomains.js';

// Cache for DNS lookup results
const domainCache = new Map();



// Common role-based domains
const roleBasedDomains = [
    'example.com', 'test.com', 'example.org', 'test.org', 'example.net', 'test.net'
];

// Unlikely valid email patterns (partial matching)
const unlikelyPatterns = [
    // Generic patterns:
    'nospam', 'spam@', '@example', 'example@', 'nothanks', 'testing@',
    'nojunk', 'junk@', 'junkmail@', 'junkmail.',
    'xxx@xxx.', 'xx@xx.', 'yyy@yyy.', 'yy@yy.', 'zz@zz.', 'zzz@zzz.',
    'www@www.', 'ww@ww.', 'qwerty@qwerty.', 'qwert@qwert.', 'qwe@qwe.', 
    'asdfg@asdfg.', 'asdf@asdf.', 'asd@asd.', 'as@as.', 'a@a.', 
    '123@123.', '123@456.', 'fakeemail', 'faker@', 
    'test1@', 'test2@', 'test3@', 'test4@', 'test5@', 'test6@', 'test7@', 'test8@', 'test9@', 'test10@',
    'test123@', 'test456@', 'test789@', 'test101@', 'test112@', 'test1234@', 'test12345@', 'test123456@', 'test1234567@', 'test12345678@', 'test123456789@',
    'invalid1@', 'invalid12@', 'invalid123@', 'invalid1234@', 'invalid12345@', 'invalid123456@', 'invalid1234567@', 'invalid12345678@', 'invalid123456789@',
    'noemail@', 'nouser@', 'nope@', 
    'bogus@', 'random@', 'dummy@', 'dummy123@', 
    'anon@', 'anonymous@', 'anonymous123@', 'anonymous1234@', 'anonymous12345@', 'anonymous123456@', 'anonymous1234567@', 'anonymous12345678@', 'anonymous123456789@',
    'spamtrap', 'honeypot@', 
    'testing', 'test@', 'test.com', 'test.net', 'test.org',
    '.invalid', 'invalid@', 'fake@', '.fake', 'no1@', 'noone@', 'none@', 'na@',
    'unknown@', 'unknown.com', 'notreal.com', '@fake.', '@invalid.', 
    'haha@', 'hehe@', 'hoho@', 'hmm@', 'hmmm@', 'hmmmm@', 'hmmmmm@', 'hmmmmmm@',
    'lol@', 'lul@', 'lulz@', '@lulz.com', '@lulz.net', '@lulz.org', '@lolz.com',
    '@lol.com', '@haha.com', '@hehe.com', '@hoho.com',
    '@hmm.com', '@hmmm.com', '@hmmmm.com', '@hmmmmm.com', '@hmmmmmm.com',

    // Mispelled gmail domainparts:
    'gmial.com', 'gamil.com', 'gmal.com', 'gmial.com', 'gamil.com', 'gmail.cm', 'gmaill.com', 'gmai.com', 'gmaail.com', 'gmail.comm', 'gmsil.com', 'gnail.com',
    'gmal.com', 'gmai.com', 'gmaill.com', 'gamail.com', 'g-mail.com', 'gimail.com', 'gmail.cm',
    
    // Mispelled hotmail domainparts:
    'hotmaail.com', 'hotmai.com', 'hotmal.com', 'hotmial.com', 'hotmali.com', 'hotmsil.com', 'hotail.com', 'hotmaiil.com', 'htomail.com',
    'hotmale.com', 'hotmain.com', 'hotmail.com', 'hotmai.com', 'hotmal.com', 'hotmial.com', 'hotmali.com', 'hotmsil.com', 'hotail.com', 
    'hotmaiil.com', 'htomail.com', 'hotmai.com', 'hotmal.com', 'hotmial.com', 'hotmali.com', 'hotmsil.com', 'hotail.com', 'hotmaiil.com', 'htomail.com',
    'hotmail.cm',
    
    // Mispelled yahoo domainparts:
    'yahho.com', 'yaho.com', 'yahhoo.com', 'yaoo.com', 'yayoo.com', 'yahop.com', 'yhaoo.com',
    'yahooo.com', 'yahhoo.com', 'yaho.com', 'yahooo.com', 'yahhoo.com', 'yaahoo.com',
    'yahoo.cm',
    
    // Mispelled other domainparts:
    'outlok.com', 'otlook.com', 'outluok.com', 'outloook.com', 'yahhoo.com',  'outllok.com',
    'outlook.cm',
    
    'aool.com', 'aol.cm', 'a0l.com', 'aoo.com', 'al.com', 'aol.cm',,

    'icloudd.com', 'iclloud.com', 'icllod.com', 'icoud.com', 'iclloudd.com', 'iclod.com',
    'icloud.cm',

    'protonmaill.com', 'protonmailll.com', 'protomail.com', 'promtomail.com',
    'prtonmail.com', 'promtonmail.com', 'protonmail.cm', 
    
    'yail.com', 'ymaill.com', 'ymaili.com', 'ymaail.com',
    'ymial.com', 'lve.com', 'livee.com', 'liev.com', 'lvie.com', 'liive.com',
    'live.cm',
    'rocketmaill.com', 'roketmail.com', 'rocktmail.com', 'rocketmaiil.com',
    'rocketmaul.com', 'rocketmail.cm', 
    'zohoo.com', 'zohi.com', 'zoo.com', 'zohoemail.com', 'zohoemail.cm'
];


// Deep check patterns for unlikely valid emails (boundary-aware partial matching)
const unlikelyDeepPatterns = ['fake', 'invalid', 'spam', 'junk', 'nothanks', 'notreal', 'scam'];

/**
 * Check if email contains any unlikely pattern with word boundaries
 * @param {string} email - Email to check
 * @param {string[]} patterns - Patterns to check against
 * @returns {boolean} - True if any pattern matches with word boundaries
 */
function hasUnlikelyDeepPattern(email, patterns) {
    // Convert to lowercase for case-insensitive matching
    const lowerEmail = email.toLowerCase();
    
    // Check each pattern
    return patterns.some(pattern => {
        // Create a regex that matches the pattern with word boundaries or start/end of string
        // This ensures the pattern is either at the start, end, or surrounded by non-word characters
        const regex = new RegExp(`(^|[^a-zA-Z0-9])${pattern}([^a-zA-Z0-9]|$)`, 'i');
        return regex.test(lowerEmail);
    });
}

/**
 * Check if email contains any unlikely pattern 
 * @param {string} email - Email to check
 * @param {string[]} patterns - Patterns to check against
 * @returns {boolean} - True if any pattern matches via partial matching
 */
function hasUnlikelyPattern(email, patterns) {
    // Convert to lowercase for case-insensitive matching
    const lowerEmail = email.toLowerCase();
    
    // Check each pattern
    return patterns.some(pattern => {
        return lowerEmail.includes(pattern);
    });
}

/**
 * Check if local part of email contains unlikely localpart-domainpart combination
 * @param {string} email - Email to check
 * @returns {boolean} - True if local part contains unlikely localpart-domainpart combination, such as 'gmail.com@gmail.com'
 */
function isUnlikelyLocalpartDomainpartCombination(email) {
    const localPart = extractLocalPart(email).toLowerCase().replace(/[^a-z0-9]/g, '');
    const domainPart = extractDomain(email).toLowerCase().replace(/[^a-z0-9]/g, '');

    if (localPart.length < 3 || domainPart.length < 3) return false;
    
    // Return true if localPart equals domainPart (e.g. gmail.com@gmail.com)
    if (localPart === domainPart) return true;

    
    return false;
}

/**
 * Check if local part of email contains consecutive non-alphanumeric characters
 * @param {string} email - Email to check
 * @returns {boolean} - True if local part contains consecutive non-alphanumeric characters
 */
function hasConsecutiveNonAlphanumeric(email) {
    const atIndex = email.indexOf('@');
    if (atIndex === -1) return false; // Not a valid email format
    
    const localPart = email.substring(0, atIndex);
    // Match any two or more consecutive non-alphanumeric characters
    return /[^a-zA-Z0-9]{2,}/.test(localPart);
}

/**
 * Check if local part of email contains too many repeated characters
 * @param {string} email - Email to check
 * @param {number} maxRepetition - Maximum allowed consecutive repeated characters
 * @returns {boolean} - True if local part contains too many repeated characters
 */
function hasExcessiveRepetition(email, maxRepetition) {
    const atIndex = email.indexOf('@');
    if (atIndex === -1) return false; // Not a valid email format
    
    const localPart = email.substring(0, atIndex);
    // Create a regex that matches any character (.) followed by the same character (\1) 
    // repeated maxRepetition-1 more times (total of maxRepetition identical characters)
    const repetitionRegex = new RegExp(`(.)\\1{${maxRepetition - 1},}`, 'i');
    return repetitionRegex.test(localPart);
}

/**
 * Main function to validate an email address
 * @param {string} email - The email to validate
 * @param {Object} options - Validation options
 * @returns {Promise<Object>} - Validation result
 */
async function validateEmail(email, options = {}) {
    // Set default options
    const defaultOptions = {
        allowUnlikely: false,
        allowRoleBased: false,
        allowDisposable: false,
        checkMx: true,
        allowNoWebsiteDomain: false, // New option to control A record check
        maxLocalpartRepetition: 5 // Maximum allowed consecutive repeated characters in local part
    };

    const opts = { ...defaultOptions, ...options };
    const result = {
        email,
        valid: true,
        reason: null,
        isRoleBased: false,
        isDisposable: false,
        isUnlikely: false,
        hasMx: true,
        hasARecord: true
    };

    // Basic format validation
    if (!isValidEmailFormat(email)) {
        result.valid = false;
        result.reason = 'invalid format';
        return result;
    }

    // Length and format validation for localpart and domain
    if (!opts.allowUnlikely) {
        const localPart = extractLocalPart(email);
        const domain = extractDomain(email);
        const localpartMinLen = 3;
        const localpartMaxLen = 32;
        const domainMinLen = 5;
        const domainMaxLen = 128;

        // Check local part length
        if (localPart.length < localpartMinLen || localPart.length > localpartMaxLen) {
            result.valid = false;
            result.reason = `local part must be between ${localpartMinLen} and ${localpartMaxLen} characters`;
            return result;
        }

        // Check domain length
        if (domain.length < domainMinLen || domain.length > domainMaxLen) {
            result.valid = false;
            result.reason = `domain must be between ${domainMinLen} and ${domainMaxLen} characters`;
            return result;
        }

        // Check if local part starts or ends with non-alphanumeric character
        if (!/^[a-z0-9]/i.test(localPart) || !/[a-z0-9]$/i.test(localPart)) {
            result.valid = false;
            result.reason = 'local part cannot start or end with a non-alphanumeric character';
            return result;
        }
    }

    // Check for unlikely patterns, consecutive non-alphanumeric characters, and excessive repetition
    const hasUnlikelyPatterns = hasUnlikelyPattern(email, unlikelyPatterns) || 
                                hasUnlikelyDeepPattern(email, unlikelyDeepPatterns) ||
                                hasConsecutiveNonAlphanumeric(email) ||
                                isUnlikelyLocalpartDomainpartCombination(email) ||
                                hasExcessiveRepetition(email, opts.maxLocalpartRepetition);
                               
    if (hasUnlikelyPatterns) {
        result.isUnlikely = true;
        if (!opts.allowUnlikely) {
            result.valid = false;
            result.reason = 'Email seems unlikely to be valid';
            return result;
        }
    }
    
    if (!opts.allowUnlikely && result.isUnlikely) {
        result.valid = false;
        result.reason = 'unlikely a valid email';
        return result;
    }

    // Check for role-based email addresses
    result.isRoleBased = isRoleBasedEmail(email, roleBasedEmails, roleBasedDomains);
    if (!opts.allowRoleBased && result.isRoleBased) {
        result.valid = false;
        result.reason = 'role-based email';
        return result;
    }

    // Check for disposable email addresses
    result.isDisposable = isDisposableEmail(email, disposableDomains);
    if (!opts.allowDisposable && result.isDisposable) {
        result.valid = false;
        result.reason = 'disposable email';
        return result;
    }

    // Check MX records if enabled
    if (opts.checkMx) {
        try {
            result.hasMx = await hasValidMXRecord(email);
            if (!result.hasMx) {
                result.valid = false;
                result.reason = 'no valid MX record';
                return result;
            }
        } catch (error) {
            console.error('Error checking MX records:', error);
            // If MX check fails, assume valid (conservative approach)
            result.hasMx = true;
        }
    }

    // Check for A record if domain website check is enabled
    if (!opts.allowNoWebsiteDomain) {
        try {
            result.hasARecord = await hasValidARecord(email);
            if (!result.hasARecord) {
                result.valid = false;
                result.reason = 'domain has no website';
                return result;
            }
        } catch (error) {
            console.error('Error checking A records:', error);
            // If A record check fails, assume valid (conservative approach)
            result.hasARecord = true;
        }
    }

    return result;
}

/**
 * Validate email format using regex
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid format
 */
function isValidEmailFormat(email) {
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return pattern.test(email);
}

/**
 * Check for unlikely valid email addresses
 * @param {string} email - Email to check
 * @param {string[]} patterns - Patterns to check against
 * @returns {boolean} - True if email is unlikely to be valid
 */
function isUnlikelyValid(email, patterns) {
    const cleaned = email.replace(/[^a-zA-Z@]/g, '').toLowerCase();
    return patterns.some(pattern => cleaned.includes(pattern));
}

/**
 * Check if email is role-based
 * @param {string} email - Email to check
 * @param {string[]} roleEmails - List of role-based email patterns
 * @param {string[]} roleDomains - List of role-based domains
 * @returns {boolean} - True if email is role-based
 */
function isRoleBasedEmail(email, roleEmails, roleDomains) {
    const domain = extractDomain(email).toLowerCase();
    const localPart = extractLocalPart(email).toLowerCase();

    // Check if domain is in role-based domains
    if (roleDomains.includes(domain)) {
        return true;
    }

    // Pattern based check to include more exotic cases of 'MyVodafone.no-reply@vodafone.ro' etc
    const roleBasedPatterns = ['no-reply', 'noreply', 'sales@'];
    if (roleBasedPatterns.some(pattern => localPart.includes(pattern))) {
        return true;
    }

    // Check if local part is a role-based email
    return roleEmails.some(role => localPart === role);
}

/**
 * Check if email is from a disposable domain
 * @param {string} email - Email to check
 * @param {string[]} disposableDomains - List of disposable domains
 * @returns {boolean} - True if email is from a disposable domain
 */
function isDisposableEmail(email, disposableDomains) {
    const domain = extractDomain(email).toLowerCase();
    return disposableDomains.includes(domain);
}

/**
 * Check if domain has valid A records (website)
 * @param {string} email - Email to check
 * @returns {Promise<boolean>} - True if domain has valid A records
 */
async function hasValidARecord(email) {
    const domain = extractDomain(email);
    const cacheKey = `a_${domain}`;

    // Check cache first
    if (domainCache.has(cacheKey)) {
        return domainCache.get(cacheKey);
    }

    try {
        // Use Google's DNS over HTTPS API
        const response = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
        const data = await response.json();

        // Check if A records exist and have valid IP addresses
        const hasARecord = data.Answer &&
            data.Answer.length > 0 &&
            data.Answer.some(record =>
                record.type === 1 &&
                record.data &&
                /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(record.data)
            );

        // Cache the result
        domainCache.set(cacheKey, hasARecord);

        return hasARecord;
    } catch (error) {
        console.error('Error checking A records:', error);
        // If DNS check fails, assume valid (conservative approach)
        return true;
    }
}

/**
 * Check if domain has valid MX records
 * @param {string} email - Email to check
 * @returns {Promise<boolean>} - True if domain has valid MX records
 */
async function hasValidMXRecord(email) {
    const domain = extractDomain(email);
    const cacheKey = `mx_${domain}`;

    // Check cache first
    if (domainCache.has(cacheKey)) {
        return domainCache.get(cacheKey);
    }

    try {
        // Use Google's DNS over HTTPS API
        const response = await fetch(`https://dns.google/resolve?name=${domain}&type=MX`);
        const data = await response.json();

        // Check if MX records exist
        const hasMX = data.Answer && data.Answer.length > 0;

        // Cache the result
        domainCache.set(cacheKey, hasMX);

        return hasMX;
    } catch (error) {
        console.error('Error checking MX records:', error);
        // If DNS check fails, assume valid (conservative approach)
        return true;
    }
}

/**
 * Extract domain from email
 * @param {string} email - Email address
 * @returns {string} - Domain part of the email
 */
function extractDomain(email) {
    return email.split('@')[1] || '';
}

/**
 * Extract local part from email
 * @param {string} email - Email address
 * @returns {string} - Local part of the email
 */
function extractLocalPart(email) {
    return email.split('@')[0] || '';
}

// Export functions for use in other modules
window.EmailValidator = {
    validateEmail,
    isValidEmailFormat,
    isRoleBasedEmail,
    isDisposableEmail,
    hasValidMXRecord,
    extractDomain,
    extractLocalPart
};

// Add event listener for DOMContentLoaded to ensure the script runs after the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Email Validator loaded and ready to use!');
});
