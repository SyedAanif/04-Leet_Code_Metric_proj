// Add any scripting/JS only when the DOM Content is completely loaded
document.addEventListener("DOMContentLoaded", function () {
  // All the components involved in our HTML
  const searchButton = document.getElementById("search-btn");
  const usernameInput = document.getElementById("user-input");

  const statsContainer = document.querySelector(".stats-container");
  const easyProgressCircle = document.querySelector(".easy-progress");
  const mediumProgressCircle = document.querySelector(".medium-progress");
  const hardProgressCircle = document.querySelector(".hard-progress");

  const easyLabel = document.getElementById("easy-label");
  const mediumLabel = document.getElementById("medium-label");
  const hardLabel = document.getElementById("hard-label");

  const cardStatsContainer = document.querySelector(".stats-card");

  // validates a username against a RegEx
  function validateUsername(username) {
    if (username.trim() === "") {
      alert("Username should not be empty");
      return false;
    }
    const regex = /^[a-zA-Z0-9_-]{1,15}$/;
    const isMatching = regex.test(username);
    if (!isMatching) {
      alert(`Invalid Username: ${username}`);
    }
    return isMatching;
  }

  // update the progress in the circles
  // see --progress-degree in CSS in conic-gradient
  function updateProgress(solved, total, label, circle) {
    const progressDegree = (solved / total) * 100; // percentage

    // set the CSS of the var --progress-degree
    circle.style.setProperty("--progress-degree", `${progressDegree}%`);

    // set the label of the circle
    label.textContent = `${solved}/${total}`;
  }

  /*
    User Details: {
  "status": "success",
  "message": "retrieved",
  "totalSolved": 323,
  "totalQuestions": 3279,
  "easySolved": 61,
  "totalEasy": 823,
  "mediumSolved": 220,
  "totalMedium": 1715,
  "hardSolved": 42,
  "totalHard": 741,
  "acceptanceRate": 62.92,
  "ranking": 249763,
  "contributionPoints": 576,
  "reputation": 0,
    */
  function displayUserData(data) {
    const {
      easySolved,
      totalEasy,
      mediumSolved,
      totalMedium,
      hardSolved,
      totalHard,
      totalSolved,
    } = data;

    updateProgress(easySolved, totalEasy, easyLabel, easyProgressCircle);
    updateProgress(
      mediumSolved,
      totalMedium,
      mediumLabel,
      mediumProgressCircle
    );
    updateProgress(hardSolved, totalHard, hardLabel, hardProgressCircle);

    // populate card-stats
    const cardsData = [
      { label: "Total Submissions", value: totalSolved },
      { label: "Total Easy Submissions", value: easySolved },
      { label: "Total Medium Submissions", value: mediumSolved },
      { label: "Total Hard Submissions", value: hardSolved },
    ];
    cardStatsContainer.innerHTML = cardsData
      .map((data) => {
        return `
        <div class="card">
        <h4>${data.label}</h4>
        <p>${data.value}</p>
        </div>`;
      })
      .join("");
  }

  // API to fetch user details
  async function fetchUserDetails(username) {
    const url = `https://leetcode-stats-api.herokuapp.com/${username}`;
    try {
      // change serach button text
      searchButton.textContent = "Searching...";
      searchButton.disabled = true;
      statsContainer.style.setProperty("visibility","hidden");

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Unable to fetch user: ${username} details`);
      }
      const data = await response.json();

      if (data["message"] !== "retrieved") {
        throw new Error(`Username not found`);
      }
      console.log(`User Details: ${JSON.stringify(data, null, 2)}`);
      displayUserData(data);
    } catch (error) {
      statsContainer.innerHTML = "<p>No data found</p>";
    } finally {
      searchButton.textContent = "Search";
      searchButton.disabled = false;
      usernameInput.value = "";
      statsContainer.style.setProperty("visibility","visible");
    }
  }

  // click event listener
  searchButton.addEventListener("click", function () {
    // fetch user input
    const username = usernameInput.value;
    console.log(`Username: ${username}`);
    if (validateUsername(username)) {
      fetchUserDetails(username);
    }
  });
});
