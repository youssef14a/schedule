const months = ["يناير", "فبراير", "مارس"];
const daysOfWeek = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
const studyHours = [1, 2, 3];
let totalStudyHours = studyHours.reduce((acc, hours) => acc + (hours * 30), 0); // Total hours for 90 days
let completedDays = 0;

// Load saved data from Local Storage
const savedData = JSON.parse(localStorage.getItem("studyPlanData")) || {
    totalStudyHours: totalStudyHours,
    completedDays: 0,
    dayStates: Array(90).fill({ completed: false, seconds: 0 })
};

totalStudyHours = savedData.totalStudyHours;
completedDays = savedData.completedDays;

function createStudyPlan() {
    const container = document.getElementById("study-plan");
    const totalHoursDiv = document.getElementById("total-hours");
    const progressBar = document.getElementById("progress");
    const progressText = document.getElementById("progress-text");
    const resetButton = document.getElementById("reset-button");

    // Display total hours initially
    totalHoursDiv.textContent = `إجمالي الساعات المتبقية: ${totalStudyHours} ساعة`;

    // Update progress bar
    const progressPercentage = (completedDays / 90) * 100;
    progressBar.style.width = `${progressPercentage}%`;
    progressText.textContent = `${Math.round(progressPercentage)}%`;

    // Reset button functionality
    resetButton.addEventListener("click", () => {
        localStorage.removeItem("studyPlanData");
        location.reload();
    });

    months.forEach((month, monthIndex) => {
        const monthDiv = document.createElement("div");
        monthDiv.className = "month-container";

        // Month Header
        const monthHeader = document.createElement("div");
        monthHeader.className = "month-header";
        monthHeader.textContent = `شهر ${month}`;
        monthDiv.appendChild(monthHeader);

        const table = document.createElement("table");
        const thead = document.createElement("thead");
        const tbody = document.createElement("tbody");

        // Table headers
        const headerRow = document.createElement("tr");
        ["اليوم", "التاريخ", "الوقت", "العداد", "التحكم"].forEach(headerText => {
            const th = document.createElement("th");
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Table rows
        for (let day = 1; day <= 30; day++) {
            const row = document.createElement("tr");

            // Day of the week
            const dayOfWeekCell = document.createElement("td");
            dayOfWeekCell.textContent = daysOfWeek[(day - 1) % 7];
            row.appendChild(dayOfWeekCell);

            // Date
            const dateCell = document.createElement("td");
            dateCell.textContent = `${day} ${month}`;
            row.appendChild(dateCell);

            // Study time
            const timeCell = document.createElement("td");
            timeCell.textContent = `${studyHours[monthIndex]} ساعة`;
            row.appendChild(timeCell);

            // Timer
            const timerCell = document.createElement("td");
            const timerDiv = document.createElement("div");
            timerDiv.className = "timer";
            timerDiv.textContent = "00:00:00";
            timerCell.appendChild(timerDiv);
            row.appendChild(timerCell);

            // Start Button
            const controlCell = document.createElement("td");
            const startButton = document.createElement("button");
            startButton.textContent = "ابدأ";
            let interval = null;

            const dayIndex = (monthIndex * 30) + (day - 1);
            const dayState = savedData.dayStates[dayIndex];

            if (dayState.completed) {
                startButton.classList.add("disabled");
                startButton.textContent = "انتهى";
                timerDiv.textContent = "01:00:00"; // Completed state
            } else if (dayState.seconds > 0) {
                // Resume the timer from the saved seconds
                setTimeout(() => {
                    startTimer(
                        timerDiv,
                        studyHours[monthIndex],
                        row,
                        startButton,
                        totalHoursDiv,
                        progressBar,
                        progressText,
                        dayIndex,
                        dayState.seconds
                    );
                    activateRow(row);
                }, 500); // Small delay to ensure UI is ready
            }

            startButton.addEventListener("click", () => {
                if (!startButton.classList.contains("disabled")) {
                    startButton.classList.add("disabled");
                    startTimer(
                        timerDiv,
                        studyHours[monthIndex],
                        row,
                        startButton,
                        totalHoursDiv,
                        progressBar,
                        progressText,
                        dayIndex
                    );
                    activateRow(row);
                }
            });

            controlCell.appendChild(startButton);
            row.appendChild(controlCell);
            tbody.appendChild(row);
        }

        table.appendChild(tbody);
        monthDiv.appendChild(table);
        container.appendChild(monthDiv);
    });
}

function startTimer(
    timerElement,
    hours,
    row,
    button,
    totalHoursDiv,
    progressBar,
    progressText,
    dayIndex,
    resumeSeconds = 0
) {
    let seconds = resumeSeconds || 0;
    const totalSeconds = hours * 3600;

    const interval = setInterval(() => {
        if (seconds >= totalSeconds) {
            clearInterval(interval);
            timerElement.classList.remove("active");
            row.classList.remove("active-row");
            button.textContent = "انتهى";

            // Decrease total hours and update progress bar
            totalStudyHours -= hours;
            completedDays++;
            totalHoursDiv.textContent = `إجمالي الساعات المتبقية: ${totalStudyHours} ساعة`;
            const progressPercentage = (completedDays / 90) * 100;
            progressBar.style.width = `${progressPercentage}%`;
            progressText.textContent = `${Math.round(progressPercentage)}%`;

            // Add visual effect to progress bar
            progressBar.style.transition = "width 0.5s ease, background-color 0.5s ease";
            progressBar.style.backgroundColor = "#28a745"; // Green color for completion
            setTimeout(() => {
                progressBar.style.backgroundColor = "#007bff"; // Back to blue
            }, 500);

            // Show motivational message
            alert("يوم رائع! استمر في العمل الجاد.");

            // Save state to Local Storage
            const savedData = JSON.parse(localStorage.getItem("studyPlanData")) || {};
            savedData.totalStudyHours = totalStudyHours;
            savedData.completedDays = completedDays;
            savedData.dayStates[dayIndex] = { completed: true, seconds: 0 }; // Mark as completed
            localStorage.setItem("studyPlanData", JSON.stringify(savedData));
        } else {
            const hrs = Math.floor(seconds / 3600).toString().padStart(2, "0");
            const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
            const secs = (seconds % 60).toString().padStart(2, "0");
            timerElement.textContent = `${hrs}:${mins}:${secs}`;
            seconds++;

            // Save current seconds to Local Storage
            const savedData = JSON.parse(localStorage.getItem("studyPlanData")) || {};
            savedData.dayStates[dayIndex] = { completed: false, seconds };
            localStorage.setItem("studyPlanData", JSON.stringify(savedData));
        }
    }, 1000);

    timerElement.classList.add("active");
}

function activateRow(row) {
    row.classList.add("active-row");
}

createStudyPlan();