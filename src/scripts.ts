import axios from "axios";
import { formatDistance, formatDistanceToNow, format, parse, parseISO } from "date-fns";


const playerWrapper: Element = document.querySelector(
  ".js-playerProfile-wrapper"
);

const playerProfile: HTMLFormElement = document.querySelector(".js-player-profile");

type Player = {
  id: number;
  name: string;
  dob: string;
  position: string;
  jerseynum: number;
  image: string; 
  created: Date;
};

const drawDatabase = () => {
  axios.get<Player[]>("http://localhost:3004/players").then(({ data }) => {

    // Clear existing content
    playerWrapper.innerHTML = "";
    let playerFname: string = "";

    data.forEach((player) => {
      // Create player element
      const playerDiv = document.createElement("div");
      playerDiv.classList.add("playerCard");
      playerFname = player.name.split(" ")[0];

      // Construct image source based on the player's name

      const imageName = player.name.replace(/\s+/g, "%20"); // Replace spaces with %20
      const imgSrc = `assets/images/${imageName}.png`;
      const imgTag = `<img src="${imgSrc}" alt="Player Image" class="playerImage">`;

      // Format the creation time
      const playerCardCreated = formatDistanceToNow(new Date(player.created), { addSuffix: true });


      playerDiv.innerHTML = `

      ${imgTag}
		
		  <h1>${player.name}</h1>
		
        <p>${playerFname} - born on ${player.dob}. Plays ${getPositionText(
        player.position
      )} for Los Angeles Lakers. ${player.name} wears #${player.jerseynum}</p>
          
        <button class=" editButton js-player-edit" data-player-id="${
          player.id
        }">Edit</button>

        <button class=" deleteButton js-player-delete" data-player-id="${
          player.id
        }">Delete</button>
        
        <p>Created ${playerCardCreated}</p>
      `;

        // Add click event to edit button
        const playerEditButton =
        playerDiv.querySelector<HTMLButtonElement>(".js-player-edit");
      playerEditButton.addEventListener("click", () => {
        const id = playerEditButton.dataset.playerId;
        // GET player data and populate the form
        axios.get<Player>(`http://localhost:3004/players/${id}`).then(({ data }) => {
          editForm(data);
        });
      });

      // Add click event to delete button
      const playerDeleteButton =
        playerDiv.querySelector<HTMLButtonElement>(".js-player-delete");
      playerDeleteButton.addEventListener("click", () => {
        const id = playerDeleteButton.dataset.playerId;
        axios.delete(`http://localhost:3004/players/${id}`).then(() => {
          // Update the displayed players after deletion
          drawDatabase(); 
        });
      });
      // Append the created elements to playerWrapper
      playerWrapper.appendChild(playerDiv);
    });
  });
};

// Call the function when the document is ready
document.addEventListener("DOMContentLoaded", () => {
  jerseyNumberOptions();
  drawDatabase();
});

// Function to populate the form fields with player data
const editForm = (player: Player) => {
  
  const playerNameInput =
    playerProfile.querySelector<HTMLInputElement>(".js-playerName");
  playerNameInput.value = player.name;

  const playerPositionInput =
    playerProfile.querySelector<HTMLInputElement>(".js-playerPosition");
  playerPositionInput.value = player.position;

  const playerDateOfBirthInput =
    playerProfile.querySelector<HTMLInputElement>(".js-playerDoB");
  playerDateOfBirthInput.value = player.dob;

  const playerNumberInput =
    playerProfile.querySelector<HTMLInputElement>(".js-playerNumber");
  playerNumberInput.value = player.jerseynum.toString();

  // Set the player ID as a data attribute on the form for later reference
  playerProfile.dataset.playerId = player.id.toString();

  // Change the text of the submit button to indicate editing
  const addButton = playerProfile.querySelector<HTMLButtonElement>(".addButton");
  addButton.textContent = "Edit Player";
};

// Event listener for the form submission
playerProfile.addEventListener("submit", (event) => {
  event.preventDefault();

  const playerId = playerProfile.dataset.playerId; 

  const playerNameInput =
    playerProfile.querySelector<HTMLInputElement>(".js-playerName");
  const playerNameInputValue = playerNameInput.value;

  const playerPositionInput =
    playerProfile.querySelector<HTMLInputElement>(".js-playerPosition");
  const playerPoisitionInputValue = playerPositionInput.value;

  const playerDateOfBirthInput =
    playerProfile.querySelector<HTMLInputElement>(".js-playerDoB");
  const playerDateOfBirthInputValue = playerDateOfBirthInput.value;

  const playerNumberInput =
    playerProfile.querySelector<HTMLInputElement>(".js-playerNumber");
  const playerNumberInputValue = playerNumberInput.value;

  const currentDate = new Date();

  if (playerId) {
    // If playerId is available, it means we are editing an existing player
    axios
      .put(`http://localhost:3004/players/${playerId}`, {
        name: playerNameInputValue,
        position: playerPoisitionInputValue,
        dob: playerDateOfBirthInputValue,
        jerseynum: playerNumberInputValue,
        image: playerNameInputValue,
        created: currentDate,
      })
      .then(() => {
        // Reset form and update the displayed players
        resetForm();
        drawDatabase();
      });
  } else {
    // If playerId is not available, it means we are adding a new player
    axios
      .post("http://localhost:3004/players", {
        name: playerNameInputValue,
        position: playerPoisitionInputValue,
        dob: playerDateOfBirthInputValue,
        jerseynum: playerNumberInputValue,
        image: playerNameInputValue,
        created: currentDate,
      })
      .then(() => {
        // Reset form and update the displayed players
        resetForm();
        drawDatabase();
      });
  }
});

// Function to reset the form after submission
const resetForm = () => {
  playerProfile.reset();
  // Clear the player ID
  playerProfile.dataset.playerId = ""; 

  // Change the text of the submit button back
  const addButton = playerProfile.querySelector<HTMLButtonElement>(".addButton");
  addButton.textContent = "Add Player";
};

//Function to allow chose jersey number from 0-99 and double-zero "00"
const jerseyNumberOptions = () => {
  const jerseyNumber = document.getElementById("playerNumber");

  // Option for double 0
  const doubleZero = document.createElement("option");
  doubleZero.value = "00";
  doubleZero.textContent = "00";
  jerseyNumber.appendChild(doubleZero);

  // Options for single-digit numbers
  for (let i = 0; i <= 99; i++) {
    const option = document.createElement("option");
    const value = i.toString();
    option.value = value;
    option.textContent = value;
    jerseyNumber.appendChild(option);
  }
};

// Function to change Template literal for innerHTML so it does not load values from select options.
const getPositionText = (position: string): string => {

  // Create a mapping between option values and custom display texts
  const positionMapping: Record<string, string> = {
    point_guard: "star point guard",
    shooting_guard: "sharpshooting guard",
    small_forward: "versatile small forward",
    power_forward: "dominant power forward",
    center: "stalwart center",
  };

  // Return the custom text based on the position value
  return positionMapping[position];
};
