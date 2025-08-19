// Theme management
class ThemeManager {
    constructor() {
        this.sunIcon = document.getElementById('themeToggle');
        this.moonIcon = document.getElementById('themeToggle2');
        this.init();
    }

    init() {
        // Load saved theme or default to light
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);

        // Add event listeners
        this.sunIcon.addEventListener('click', () => {
            this.setTheme('light');
            localStorage.setItem('theme', 'light');
            document.dispatchEvent(new Event('themeChanged'));
        });

        this.moonIcon.addEventListener('click', () => {
            this.setTheme('dark');
            localStorage.setItem('theme', 'dark');
            document.dispatchEvent(new Event('themeChanged'));
        });
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
    }
    isDarkMode() {
        return document.documentElement.getAttribute('data-theme') === 'dark';
    }
}

// Email processing class
class EmailProcessor {


    constructor() {
        this.themeManager = new ThemeManager();
        this.processButton = document.getElementById('processButton');
        this.progressContainer = document.getElementById('progressContainer');
        this.progressBar = document.getElementById('progressBar');
        this.progressText = document.getElementById('progressText');
        this.resultsSection = document.getElementById('resultsSection');
        this.validEmails = document.getElementById('validEmails');
        this.invalidEmails = document.getElementById('invalidEmails');
        this.emailInput = document.getElementById('emailInput');
        this.logBox = document.getElementById('logBox'); // Add logBox reference
        this.logEntries = []; // Store log entries
        this.init();
        document.addEventListener('themeChanged', () => {
            this.updateChartTheme();
        });
    }
    updateChartTheme() {
        if (this.resultPieChart) {
            const chartTextColor = this.themeManager.isDarkMode() ? '#ffffff' : '#000000';
            this.resultPieChart.options.plugins.legend.labels.color = chartTextColor;
            this.resultPieChart.options.plugins.title.color = chartTextColor;
            this.resultPieChart3.options.plugins.legend.labels.color = chartTextColor;
            this.resultPieChart3.options.plugins.title.color = chartTextColor;
            this.resultPieChart2.options.plugins.legend.labels.color = chartTextColor;
            this.resultPieChart2.options.plugins.title.color = chartTextColor;
            this.resultPieChart.update();
            this.resultPieChart2.update();
            this.resultPieChart3.update();
        }
    }
    init() {
        this.processButton.addEventListener('click', () => {
            this.startProcessing();
        });
    }

    parseEmails(input) {
        const lines = input.trim().split('\n');
        const emails = [];

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;

            // Check if it's in "Name <email@domain.com>" format
            const nameEmailMatch = trimmedLine.match(/^(.+?)\s*<(.+?)>$/);
            if (nameEmailMatch) {
                emails.push({
                    original: trimmedLine,
                    email: nameEmailMatch[2].trim(),
                    name: nameEmailMatch[1].trim()
                });
            } else {
                // Assume it's just an email
                emails.push({
                    original: trimmedLine,
                    email: trimmedLine,
                    name: ''
                });
            }
        }

        return emails;
    }

    async startProcessing() {
        const input = this.emailInput.value.trim();
        if (!input) {
            alert('Please enter some email addresses to process.');
            return;
        }

        // Clear log at the start
        this.clearLog();
        const emails = this.parseEmails(input);
        if (emails.length === 0) {
            alert('No valid email addresses found in the input.');
            return;
        }

        // Get options
        const options = {
            allowRoleBased: document.getElementById('allowRoleBased').checked,
            allowDisposable: document.getElementById('allowDisposable').checked,
            allowUnlikely: document.getElementById('allowUnlikely').checked,
            allowNoWebsiteDomain: document.getElementById('allowNoWebsiteDomain').checked
        };

        // Show progress
        this.showProgress();
        this.updateProgress(0, emails.length);
        this.addLog(`Starting to validate an input of ${emails.length} rows...`);

        const startTime = Date.now();
        let validCount = 0;
        try {
            // Process emails in batches for better progress reporting
            const result = await this.processEmailsInBatches(emails, options);
            validCount = result.valid.length;

            // Display results
            this.displayResults(result.valid, result.invalid);

        } catch (error) {
            console.error('Processing error:', error);
            this.addLog(`Error during processing: ${error.message}`, 'error');
            alert('An error occurred while processing the emails. Please try again.');
        } finally {
            this.hideProgress();
            const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
            // this.addLog(`Validation completed after ${seconds} seconds. Found ${result.valid_count} valid looking emails out of ${emails.length}.`);
            this.addLog(`\nAnalysis completed in ${totalTime} seconds. Found ${validCount} valid emails out of ${emails.length} total.`);
        }
    }

    /**
     * Normalizes an email address by removing tags and handling Gmail/ProtonMail dot variations
     * @param {string} email - The email address to normalize
     * @returns {string} The normalized email address
     */
    normalizeEmail(email) {
        if (!email) return '';

        // Convert to lowercase
        email = email.toLowerCase().trim();

        // Handle email tags (remove everything after + but before @)
        const atIndex = email.indexOf('@');
        if (atIndex > 0) {
            let localPart = email.substring(0, atIndex);
            const domain = email.substring(atIndex);

            // Always remove everything after + in the local part for all email providers
            const plusIndex = localPart.indexOf('+');
            if (plusIndex > 0) {
                localPart = localPart.substring(0, plusIndex);
            }

            // For Gmail/ProtonMail, also remove dots from the local part
            if (domain === '@gmail.com' || domain === '@protonmail.com' || domain === '@proton.me') {
                localPart = localPart.replace(/\./g, '');
            }

            email = localPart + domain;
        }

        return email;
    }

    /**
     * Process emails in batches with deduplication
     * @param {Array} emails - Array of email objects to process
     * @param {Object} options - Processing options
     * @returns {Promise<Object>} - Object containing valid and invalid emails
     */
    async processEmailsInBatches(emails, options) {
        const batchSize = 100; // Process 100 emails at a time
        const totalEmails = emails.length;
        let processedCount = 0;
        let allValidEmails = [];
        let allInvalidEmails = [];
        const seenEmails = new Set(); // Track seen normalized emails for deduplication

        // Process emails in batches
        for (let i = 0; i < totalEmails; i += batchSize) {
            const batch = emails.slice(i, i + batchSize);

            try {
                const batchResult = await this.processEmailBatch(batch, options, seenEmails);

                // Accumulate results
                allValidEmails = allValidEmails.concat(batchResult.valid);
                allInvalidEmails = allInvalidEmails.concat(batchResult.invalid);

                // Log each email in this batch
                if (Array.isArray(batchResult.valid)) {
                    for (const e of batchResult.valid) {
                        this.addLog(`${e.original} - Valid looking email`);
                    }
                }
                if (Array.isArray(batchResult.invalid)) {
                    for (const e of batchResult.invalid) {
                        // Use the reason provided by the backend, or fallback to generic message
                        const reason = e.reason ? e.reason : 'Invalid email';
                        this.addLog(`${e.original} - Invalid email (${reason})`);
                    }
                }

                // Update progress
                processedCount += batch.length;
                this.updateProgress(processedCount, totalEmails);

                // Small delay to allow UI to update
                await new Promise(resolve => setTimeout(resolve, 10));

            } catch (error) {
                console.error(`Error processing batch ${Math.floor(i/batchSize) + 1}:`, error);
                // Continue with next batch even if current one fails
            }
        }

        return {
            valid: allValidEmails,
            invalid: allInvalidEmails,
            total: totalEmails,
            valid_count: allValidEmails.length,
            invalid_count: allInvalidEmails.length
        };
    }

    /**
     * Process a batch of emails with validation and optional deduplication
     * @param {Array} emails - Array of email objects to process
     * @param {Object} options - Processing options including deduplication settings
     * @param {Set} seenEmails - Set of already seen normalized emails for deduplication
     * @returns {Promise<Object>} - Object containing valid and invalid emails
     */
    async processEmailBatch(emails, options, seenEmails) {
        const validEmails = [];
        const invalidEmails = [];
        const allowDuplicates = document.getElementById('allowDuplicates').checked;

        // Process each email using the EmailValidator
        for (const emailData of emails) {
            try {
                const result = await EmailValidator.validateEmail(emailData.email, {
                    allowUnlikely: options.allowUnlikely,
                    allowRoleBased: options.allowRoleBased,
                    allowDisposable: options.allowDisposable,
                    allowNoWebsiteDomain: options.allowNoWebsiteDomain,
                    checkMx: true
                });

                // Add the result to the appropriate array
                if (result.valid) {
                    // Check for duplicates if not allowing them
                    const normalizedEmail = this.normalizeEmail(emailData.email);
                    if (!allowDuplicates) {
                        if (seenEmails.has(normalizedEmail)) {
                            // Skip this duplicate email
                            this.addLog(`${emailData.original} - Duplicate email (normalized to: ${normalizedEmail})`);
                            continue;
                        }
                        seenEmails.add(normalizedEmail);
                    }

                    validEmails.push({
                        original: emailData.original,
                        email: emailData.email,
                        name: emailData.name,
                        is_role_based: result.isRoleBased,
                        is_disposable: result.isDisposable,
                        is_unlikely: result.isUnlikely
                    });
                } else {
                    invalidEmails.push({
                        original: emailData.original,
                        email: emailData.email,
                        name: emailData.name,
                        reason: result.reason,
                        is_role_based: result.isRoleBased,
                        is_disposable: result.isDisposable,
                        is_unlikely: result.isUnlikely
                    });
                }
            } catch (error) {
                console.error('Error validating email:', error);
                // If there's an error, consider it invalid
                invalidEmails.push({
                    original: emailData.original,
                    email: emailData.email,
                    name: emailData.name,
                    reason: 'validation error',
                    is_role_based: false,
                    is_disposable: false,
                    is_unlikely: false
                });
            }
        }

        return {
            valid: validEmails,
            invalid: invalidEmails,
            total: emails.length,
            valid_count: validEmails.length,
            invalid_count: invalidEmails.length
        };
    }

    showProgress() {
        this.processButton.style.display = 'none';
        this.progressContainer.style.display = 'block';
        this.resultsSection.style.display = 'none';
    }

    hideProgress() {
        this.processButton.style.display = 'inline-block';
        this.progressContainer.style.display = 'none';
        // this.emailInput.value = '';
    }

    updateProgress(current, total) {
        const percentage = Math.min((current / total) * 100, 100);
        this.progressBar.style.width = `${percentage}%`;
        this.progressText.textContent = `Processing emails... ${current}/${total}`;
    }

    displayResults(validEmails, invalidEmails) {

        this.validEmails.value = validEmails.map(e => e.original).join('\n');
        this.invalidEmails.value = invalidEmails.map(e => e.original).join('\n');
        this.resultsSection.style.display = 'block';

        // ChartJS Pie Chart logic
        const totalEmails = validEmails.length + invalidEmails.length;
        const chartsContainer = document.getElementById('chartsContainer');
        if (chartsContainer) {
            chartsContainer.style.display = ((totalEmails >= 5) && (validEmails.length >= 2) && (invalidEmails.length >= 2)) ? '' : 'none';
        }
        const chartTextColor = this.themeManager.isDarkMode() ? '#ffffff' : '#000000';
        if (totalEmails >= 5) {
            // Count categories
            let validCount = validEmails.length;
            let invalidSyntaxCount = 0;
            let invalidMXCount = 0;
            for (const e of invalidEmails) {
                if (e.reason === 'invalid syntax') invalidSyntaxCount++;
                else if (e.reason === 'no valid MX record') invalidMXCount++;
            }
            // All other invalids
            let otherInvalidCount = invalidEmails.length - invalidSyntaxCount - invalidMXCount;

            // Prepare data
            const data = {
                labels: ['Valid', 'Invalid Syntax', 'Invalid DNS Record', 'Other Invalid'],
                datasets: [{
                    data: [validCount, invalidSyntaxCount, invalidMXCount, otherInvalidCount],
                    backgroundColor: [
                        '#caffbf', // green
                        '#ffadad', // red
                        '#ffc6ff', // pink
                        '#ffd6a5'  // orange
                    ],
                }]
            };

            // Destroy previous chart if exists
            if (this.resultPieChart) {
                this.resultPieChart.destroy();
            }
            const ctx = document.getElementById('resultPieChart').getContext('2d');
            this.resultPieChart = new Chart(ctx, {
                type: 'pie',
                data: data,
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color:  chartTextColor,
                            }
                        },
                        title: {
                            display: false
                        }
                    }
                }
            });
        } else {
            // Hide or clear chart if not enough emails
            if (this.resultPieChart) {
                this.resultPieChart.destroy();
                this.resultPieChart = null;
            }
            const ctx = document.getElementById('resultPieChart').getContext('2d');
            ctx.clearRect(0, 0, 400, 220);
        }

        // Chart 2: Role-based, Disposable, Unlikely
        if (totalEmails >= 5) {
            let roleBasedCount = 0;
            let disposableCount = 0;
            let unlikelyCount = 0;
            // Count in both valid and invalid
            for (const e of validEmails.concat(invalidEmails)) {
                if (e.is_role_based) roleBasedCount++;
                if (e.is_disposable) disposableCount++;
                if (e.is_unlikely) unlikelyCount++;
            }
            const data2 = {
                labels: ['Role-based', 'Disposable', 'Unlikely valid'],
                datasets: [{
                    data: [roleBasedCount, disposableCount, unlikelyCount],
                    backgroundColor: [
                        '#9bf6ff', // blue
                        '#a0c4ff', // darker blue
                        '#bdb2ff'  // purple
                    ],
                }]
            };
            if (this.resultPieChart2) {
                this.resultPieChart2.destroy();
            }
            const ctx2 = document.getElementById('resultPieChart2').getContext('2d');
            this.resultPieChart2 = new Chart(ctx2, {
                type: 'pie',
                data: data2,
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color:  chartTextColor,
                            }
                        },
                        title: {
                            display: false
                        }
                    }
                }
            });
        } else {
            if (this.resultPieChart2) {
                this.resultPieChart2.destroy();
                this.resultPieChart2 = null;
            }
            const ctx2 = document.getElementById('resultPieChart2').getContext('2d');
            ctx2.clearRect(0, 0, 400, 220);
        }

        // Chart 3: Top 5 most common domains
        if (totalEmails >= 5) {
            // Count domains in both valid and invalid
            const domainCounts = {};
            for (const e of validEmails.concat(invalidEmails)) {
                const email = e.email || '';
                const atIdx = email.lastIndexOf('@');
                if (atIdx !== -1) {
                    const domain = email.slice(atIdx + 1).toLowerCase();
                    if (domain) {
                        domainCounts[domain] = (domainCounts[domain] || 0) + 1;
                    }
                }
            }
            // Sort and get top 5
            const sortedDomains = Object.entries(domainCounts).sort((a, b) => b[1] - a[1]);
            const topDomains = sortedDomains.slice(0, 5);
            const labels3 = topDomains.map(([domain]) => domain);
            const data3 = topDomains.map(([, count]) => count);
            // If less than 5, fill with empty
            while (labels3.length < 5) {
                labels3.push('');
                data3.push(0);
            }
            const chartData3 = {
                labels: labels3,
                datasets: [{
                    data: data3,
                    backgroundColor: [
                        '#809bce', // blue
                        '#95b8d1', // teal
                        '#b8e0d4', // green
                        '#d6eadf', // mint
                        '#404e67'  // dark blue
                    ],
                }]
            };
            if (this.resultPieChart3) {
                this.resultPieChart3.destroy();
            }
            const ctx3 = document.getElementById('resultPieChart3').getContext('2d');
            this.resultPieChart3 = new Chart(ctx3, {
                type: 'pie',
                data: chartData3,
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color:  chartTextColor,
                            }
                        },
                        title: {
                            display: false
                        }
                    }
                }
            });
        } else {
            if (this.resultPieChart3) {
                this.resultPieChart3.destroy();
                this.resultPieChart3 = null;
            }
            const ctx3 = document.getElementById('resultPieChart3').getContext('2d');
            ctx3.clearRect(0, 0, 250, 150);
        }
    }

    clearLog() {
        this.logEntries = [];
        if (this.logBox) this.logBox.value = '';
    }
    addLog(entry) {
        this.logEntries.push(entry); // Add to the bottom
        if (this.logBox) this.logBox.value = this.logEntries.join('\n');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Load the email validator script
    const script = document.createElement('script');
    script.src = 'assets/js/emailValidator.js';
    script.type = 'module';
    document.head.appendChild(script);

    // Wait for the script to load
    await new Promise((resolve) => {
        script.onload = resolve;
    });

    // Initialize the application
    new ThemeManager();
    new EmailProcessor();
});

// Add some sample data for testing
document.addEventListener('DOMContentLoaded', () => {
    const emailInput = document.getElementById('emailInput');
    if (emailInput && !emailInput.value) {
        emailInput.value = `heybro@emaillistcleaner.org
Jane Doe <jane@example.com>
info@microsoft.com
nospam4meplz69@gmail.com
gmail.com@gmail.com
testing123@hotmail.com
xxx@yyy.com
MyVodafone.no-reply@vodafone.ro
jouni@greatsoftwarecompany.com
invalid@qwerty.com
john.doe@yahhoo.co.uk
`;
    }
});