import axios from "axios";

const fruitWrapper: Element = document.querySelector(".js-fruit-wrapper");

type Fruit = {
  id: number;
  name: string;
};

const drawDatabase = () => {
  fruitWrapper.innerHTML = "";

  axios.get<Fruit[]>("http://localhost:3004/fruits").then(({ data }) => {
    data.forEach((fruit) => {
      fruitWrapper.innerHTML += `
        <div>
            <h1>${fruit.name}</h1>
            <button class="js-frui-delete" data-fruit-id="${fruit.id}">Delete</button>
        </div>
        `;
    }); // GET API

    const fruitDeleteButton = document.querySelectorAll<HTMLButtonElement>(".js-frui-delete");

    fruitDeleteButton.forEach((fruitBtn) => {
        fruitBtn.addEventListener("click", () => {
            const id = fruitBtn.dataset.fruitId;

            axios.delete(`http://localhost:3004/fruits/${id}`).then(() => {
                drawDatabase();
            })
        })
    })

  });
};

//Shows initially all database
drawDatabase();

const fruitForm = document.querySelector(".js-fruit-form");

fruitForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const fruitNameInput = fruitForm.querySelector<HTMLInputElement>(
    'input[name="fruit"]'
  );
  const fruitNameInputValue = fruitNameInput.value;

  axios
    .post("http://localhost:3004/fruits", {
      name: fruitNameInputValue,
    })
    .then(() => {
      fruitNameInput.value = "";
      drawDatabase();
    });
});
