<?php
$outside_icon = '
<svg style="margin:0;padding:0;position:relative;top:4px;left:-4px;" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<g>
<path d="M10.0002 5H8.2002C7.08009 5 6.51962 5 6.0918 5.21799C5.71547 5.40973 5.40973 5.71547 5.21799 6.0918C5 6.51962 5 7.08009 5 8.2002V15.8002C5 16.9203 5 17.4801 5.21799 17.9079C5.40973 18.2842 5.71547 18.5905 6.0918 18.7822C6.5192 19 7.07899 19 8.19691 19H15.8031C16.921 19 17.48 19 17.9074 18.7822C18.2837 18.5905 18.5905 18.2839 18.7822 17.9076C19 17.4802 19 16.921 19 15.8031V14M20 9V4M20 4H15M20 4L13 11" stroke="#BBBBBB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
</g></svg>';


?><!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="apple-touch-icon" sizes="180x180" href="assets/images/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="assets/images/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="assets/images/favicon-16x16.png">
    <link rel="manifest" href="/site.webmanifest">
    <title>Email List Cleaner</title>
    <link rel="stylesheet" href="assets/css/styles.css">
    <meta name="description" content="Email List Cleaner is a privacy-first, free and open source email list cleaner. It can be used to validate a list of email addresses.">
    <meta name="keywords" content="email list validation, validate email address, open source, privacy-first">
    <meta name="author" content="Great Software Company">
    <meta property="og:title" content="Email List Cleaner">
    <meta property="og:description" content="Email List Cleaner is a privacy-first, free and open source email list cleaner. It can be used to validate a list of email addresses.">
    <meta property="og:image" content="https://emaillistcleaner.org/assets/images/email-catto.webp">
    <meta property="og:url" content="https://emaillistcleaner.org">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Email List Cleaner">
    <meta property="og:locale" content="en_US">
    <script defer data-domain="emaillistcleaner.org" src="https://plausible.io/js/script.js"></script>
</head>
<body>
<div style="width:100%;height:16px;background:url('assets/images/pattern.png') repeat-x top left;"></div>
<div class="container">
    <header>
    <img src="assets/images/email-catto.webp" alt="Email List Cleaner Cat" title="Email List Cleaner Cat" style="display: block; margin: 0 auto; width: 128px; height: auto; margin-bottom: 20px;">

        <div class="header-content">

            <h1 class="logo">Email List Cleaner</h1>
            <div class="theme-toggle">
                <img src="assets/images/toggle_sun.png" alt="Switch to Light Mode" class="theme-icon sun-icon"
                     id="themeToggle">
                <img src="assets/images/toggle_moon.png" alt="Switch to Dark Mode" class="theme-icon moon-icon"
                     id="themeToggle2">
            </div>
        </div>
    </header>

    <main>
        <div class="content">
            <p>EmailListCleaner.org is a privacy-first, free and open source email list cleaner.</p>

            <p>It validates a list of email addresses for free and in a way that no one, including us, has access to them.</p>


            <h2>How Does Email Validation Work?</h2>

            <p>Email List Cleaner performs syntax checks to see whether an email address looks like a valid email address, 
                and it also confirms that an email address has a valid domain name that has been configured to accept emails.</p>

            <p>This means that if Email List Cleaner says an email address is invalid, it is very likely invalid. But if it says an email address looks valid, it means just that, that it looks valid.</p>

            <p>When you use this tool, <i>almost</i> the entire email address validation process happens inside your browser.</p>

            <p>The only data that gets sent anywhere are the domain parts of your email addresses. 
                They are sent to Google’s DNS service to check whether the domain names are valid. You can confirm all this by checking the project’s source code.</p>

            <p>Please notice that it is technically impossible for third party websites like this one to know whether an email address is valid with perfect accuracy.</p>

            <p>Email List Cleaner can also detect and flag disposable email addresses, role-based email addresses, and it can also remove duplicate email addresses. Please see the processing options below.</p>


            <h2>How To Clean Email Address List</h2>

            <p>Enter your email addresses below, one per line. You can use either email only format or name &lt;email@domain.com&gt;
                format.</p>

            <p>The system will validate each email address and separate valid from invalid ones based on your chosen
                criteria.</p>

            <div class="input-section">
                <label for="emailInput">Email addresses to validate:</label>
                <textarea id="emailInput"
                          placeholder="Enter email addresses here, one per line&#10;Example:&#10;john@example.com&#10;Jane Doe &lt;jane@example.com&gt;&#10;info@company.com"></textarea>
            </div>

            <div class="options-section">
                <h3 style="margin-top:0; padding-top:0;">Processing Options</h3>

                <div class="option-item">
                    <label class="toggle-switch">
                        <input type="checkbox" id="allowRoleBased">
                        <span class="toggle-slider"></span>
                    </label>
                    <div class="option-text">
                        <span class="option-title">Allow role-based email addresses</span>
                        <span class="option-description">Role-based email addresses are emails such as info@example.com and sales@example.com, that is, email inbox that is relating to a role within an organization, not a person.</span>
                    </div>
                </div>

                <div class="option-item">
                    <label class="toggle-switch">
                        <input type="checkbox" id="allowDisposable">
                        <span class="toggle-slider"></span>
                    </label>
                    <div class="option-text">
                        <span class="option-title">Allow disposable email addresses</span>
                        <span class="option-description">Disposable email addresses, also known as throw-away emails and one-time-use emails, are email addresses provided by special websites that are intended to be used only for a short time.</span>
                    </div>
                </div>

                <div class="option-item">
                    <label class="toggle-switch">
                        <input type="checkbox" id="allowDuplicates">
                        <span class="toggle-slider"></span>
                    </label>
                    <div class="option-text">
                        <span class="option-title">Allow duplicate email addresses</span>
                        <span class="option-description">Allow the output list to contain the same email address more than one time. This feature 
                            supports email providers that ignore dots in the email address local part. For example, “john.doe@gmail.com“ and “johndoe@gmail.com“ are considered the same email address by Gmail,
                        and therefore they will be considered the same email address by this tool. This feature also supports email address tags. For example,
                        “john.doe+work@gmail.com“ will be considered the same email address as “john.doe@gmail.com“.</span>
                    </div>
                </div>

                <div class="option-item">
                    <label class="toggle-switch">
                        <input type="checkbox" id="allowUnlikely">
                        <span class="toggle-slider"></span>
                    </label>
                    <div class="option-text">
                        <span class="option-title">Allow unlikely valid email addresses</span>
                        <span class="option-description">Unlikely valid email addresses are email addresses such as "nothanks@example.com" and "nospam@example.com" which could be valid, but probably are not.</span>
                    </div>
                </div>

                <div class="option-item">
                    <label class="toggle-switch">
                        <input type="checkbox" id="allowNoWebsiteDomain">
                        <span class="toggle-slider"></span>
                    </label>
                    <div class="option-text">
                        <span class="option-title">Allow email addresses from domains without a website</span>
                        <span class="option-description">Typically valid email addresses will have a domain name that has some kind of website, but technically that is not a requirement. </span>
                    </div>
                </div>
            </div>

            <div class="action-section">
                <button id="processButton" class="process-btn">Start To Validate Emails</button>

                <div id="progressContainer" class="progress-container" style="display: none;">
                    <div class="progress-bar">
                        <div id="progressBar" class="progress-fill"></div>
                    </div>
                    <div id="progressText" class="progress-text">Processing emails...</div>
                </div>
            </div>

            <div id="resultsSection" class="results-section" style="display: none;">
                <div class="result-group">
                    <h3>Analysis Log</h3>
                    <textarea id="logBox" readonly style="min-height: 120px; margin-bottom: 20px;"></textarea>
                </div>
                <div id="chartsContainer">
                    <div class="result-group result-chart">
                        <h3>Results Chart</h3>
                        <canvas id="resultPieChart" width="250" height="150"
                                style="border-radius: 8px;"></canvas>
                    </div>
                    <div class="result-group result-chart">
                        <h3>Special Email Types</h3>
                        <canvas id="resultPieChart2" width="250" height="150"
                                style="border-radius: 8px;"></canvas>
                    </div>
                    <div class="result-group result-chart">
                        <h3>Top 5 Input Email Domains</h3>
                        <canvas id="resultPieChart3" width="250" height="150"
                                style="border-radius: 8px;"></canvas>
                    </div>
                </div>
                <div class="result-group">
                    <h3>Valid looking email addresses</h3>
                    <textarea id="validEmails" readonly></textarea>
                </div>

                <div class="result-group">
                    <h3>Invalid looking email addresses</h3>
                    <textarea id="invalidEmails" readonly></textarea>
                </div>
            </div>
        </div>
    </main>

    <footer>
        <p>&copy; Copyright <?php echo date('Y'); ?> <a href="https://greatsoftwarecompany.com">Great Software Company</a><?= $outside_icon; ?> 
        <a href="https://github.com/Great-Software-Company/EmailListCleaner.org">Free and open source</a><?= $outside_icon; ?> </p><br>
        <p>You can send fan mail, love letters, bug reports and other feedback via: <a href="mailto:heybro@emaillistcleaner.org">heybro@emaillistcleaner.org</a></p><br>
        <p>Terms of use: This website is provided to you “as is” without any guarantees or warranties of any kind. You are free to use this website any way you wish, but you do so entirely at your own risk.</p><br>
        <p>Privacy Policy: We respect your privacy by not spying on you. The website uses only anonymous website statistics. We do not get any information about the email addresses you validate using this website.</p>
    </footer>
</div>
<div style="width:100%;height:10px;background:url('assets/images/pattern.png') repeat-x top left;"></div>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="assets/js/script.js"></script>

</body>
</html>