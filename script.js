// --- SMART INPUT FORMATTING ---
const inputs = document.querySelectorAll('input[type="text"]');

inputs.forEach(input => {
    input.addEventListener('input', function(e) {
        if (e.inputType && e.inputType.startsWith('delete')) return;

        const digits = e.target.value.replace(/\D/g, ''); 
        let output = '';
        let idx = 0;

        // 1. Process Day
        if (idx < digits.length) {
            let d1 = digits[idx++];
            if (parseInt(d1) > 3) {
                output += '0' + d1 + '/';
            } else {
                output += d1;
                if (idx < digits.length) {
                    let d2 = digits[idx++];
                    let day = parseInt(d1 + d2);
                    if (day > 31 || day === 0) {
                         e.target.value = output; 
                         return;
                    }
                    output += d2 + '/';
                }
            }
        }

        // 2. Process Month
        if (output.endsWith('/')) {
            if (idx < digits.length) {
                let m1 = digits[idx++];
                if (parseInt(m1) > 1) {
                    output += '0' + m1 + '/';
                } else {
                    output += m1;
                    if (idx < digits.length) {
                        let m2 = digits[idx++];
                        let month = parseInt(m1 + m2);
                        if (month > 12 || month === 0) {
                            e.target.value = output;
                            return;
                        }
                        output += m2 + '/';
                    }
                }
            }
        }

        // 3. Process Year
        if (output.endsWith('/')) {
            let remaining = digits.substring(idx, idx + 4);
            output += remaining;
        }

        e.target.value = output;
    });
});

// --- NEW FORM SUBMISSION LOGIC ---
// This replaces the manual "Enter" key check
const form = document.getElementById('hgcForm');

form.addEventListener('submit', function(e) {
    e.preventDefault(); // Stop the page from reloading
    
    // Close mobile keyboard
    if (document.activeElement) {
        document.activeElement.blur();
    }
    
    calculatehg(); // Run the calculation
});

function parseDateString(dateStr) {
    if (!dateStr || dateStr.length < 10) return null;
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; 
    const year = parseInt(parts[2], 10);

    const date = new Date(year, month, day);
    if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
        return null; 
    }
    return date;
}

function calculatehg() {
    const dobInput = document.getElementById('dob').value;
    const joinDateInput = document.getElementById('joinDate').value;
    const resultDiv = document.getElementById('result');
    const btn = document.getElementById('checkBtn');

    const dob = parseDateString(dobInput);
    const joinDate = parseDateString(joinDateInput);

    if (!dob || !joinDate) {
        alert("Please enter valid dates in DD/MM/YYYY format.");
        return;
    }

    btn.disabled = true;
    
    resultDiv.style.display = 'block'; 
    resultDiv.className = 'loading'; 
    resultDiv.innerHTML = `
        <div class="spinner"></div>
        <div class="loading-text">Calculating...</div>
    `;

    setTimeout(() => {
        let seasonStartYear = joinDate.getFullYear();
        if (joinDate.getMonth() < 6) { 
            seasonStartYear -= 1;
        }

        const seasonStartDate = new Date(seasonStartYear, 6, 1);
        let ageYears = seasonStartDate.getFullYear() - dob.getFullYear();
        let monthDiff = seasonStartDate.getMonth() - dob.getMonth();
        let dayDiff = seasonStartDate.getDate() - dob.getDate();

        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
            ageYears--;
        }

        const thresholdDate = new Date(seasonStartDate);
        thresholdDate.setFullYear(seasonStartDate.getFullYear() - 19);

        const isEligible = dob >= thresholdDate;

        const hgYear = seasonStartYear + 3;
        const hgDate = new Date(hgYear, 5, 29);

        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const hgDateString = hgDate.toLocaleDateString('en-GB', options);
        const seasonStartString = seasonStartDate.toLocaleDateString('en-GB', options);
        let displayAge = getAgeString(dob, seasonStartDate);

        resultDiv.className = isEligible ? 'success' : 'failure';
        
        if (isEligible) {
            resultDiv.innerHTML = `
                <div class="result-content">
                    <div class="result-header">Eligible</div>
                    <div class="result-details">
                        This player will become home-grown.<br><br>
                        Due Date: <span class="highlight-date">${hgDateString}</span><br>
                    </div>
                </div>
            `;
        } else {
            resultDiv.innerHTML = `
                <div class="result-content">
                    <div class="result-header">Not Eligible</div>
                    <div class="result-details">
                        This player is too old.<br><br>
                        Max age on ${seasonStartString}: 19y 0d<br>
                        Player's age: ${displayAge}<br>
                    </div>
                </div>
            `;
        }

        btn.disabled = false;

    }, 100); 
}

function getAgeString(dob, targetDate) {
    let years = targetDate.getFullYear() - dob.getFullYear();
    let months = targetDate.getMonth() - dob.getMonth();
    let days = targetDate.getDate() - dob.getDate();

    if (days < 0) {
        months--;
        let prevMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 0);
        days += prevMonth.getDate();
    }
    if (months < 0) {
        years--;
        months += 12;
    }
    return `${years}y, ${months}m, ${days}d`;
}