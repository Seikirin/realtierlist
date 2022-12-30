let DataPromises = []
var cdata;

async function fetchcdata(file) {
	try {
		const response = await fetch(file);
		const exam = await response.json();
		return exam;
	} catch (error) {
		console.error(error);
	}
}

DataPromises.push(new Promise(async function (resolve, reject) {
	cdata = await fetchcdata(`data/bluearchive.json`); resolve()
}))

await Promise.all(DataPromises)

let items = document.querySelector(".items")
let art = document.querySelector(".art")
let tierlist = document.querySelector(".tierlist")
let selected = undefined;
let itemsElms = [];
let Tiers = [
	{
		Title: "SSS",
		Color: "red",
		Content: [],
	},
	{
		Title: "SS",
		Color: "red",
		Content: [],
	},
	{
		Title: "S",
		Color: "red",
		Content: [],
	},
	{
		Title: "A",
		Color: "red",
		Content: [],
	},
	{
		Title: "F",
		Color: "red",
		Content: [],
	},
];

function getOffset(el) {
	const rect = el.getBoundingClientRect();
	return {
		left: rect.left + window.scrollX,
		top: rect.top + window.scrollY
	};
}

function UpdateRemaining() {
	var viewport_width = window.innerWidth;
	art.setAttribute("style", "width: " + getOffset(tierlist).left + "px;")
}

addEventListener("resize", UpdateRemaining);
UpdateRemaining();

cdata.forEach((char, i) => {
	const div = document.createElement('div');
	div.className = 'item';
	div.setAttribute("index", i);
	const img = document.createElement('img');
	img.src = char.Icon;
	img.draggable = false;
	div.appendChild(img)
	itemsElms.push(div);
	items.appendChild(div);
})


function CreateTiers() {
	const Colors = ['#FF7F7F', '#FFBF7F', '#FFDF7F', '#FFFF7F', '#BFFF7F', '#7FFF7F', '#7FFFFF', '#7FBFFF', '#7F7FFF', '#FF7FFF', '#BF7FBF', '#3B3B3B', '#858585', '#CFCFCF', '#F7F7F7']
	Tiers.forEach(Tier => {
		if (Tier.elm)
			tierlist.removeChild(Tier.elm);
	})
	Tiers.forEach((Tier, i) => {
		if (!Tier.elm) {
			const outerDiv = document.createElement('div');
			outerDiv.className = 'tier';

			outerDiv.innerHTML += `
            <div class="label-holder" contenteditable="true" style="background-color: `+ Tier.Color + `;">
                <span class="label">` + Tier.Title + `</span>
            </div>
            `
			const tierContentDiv = document.createElement('div');
			tierContentDiv.className = 'tiercontent';

			outerDiv.appendChild(tierContentDiv);

			outerDiv.innerHTML +=
				`
            <div class="tiercontrols">
                <div class="top">
                    <img id = "move" draggable=false src="https://cdn-icons-png.flaticon.com/512/60/60564.png">
                    <img id = "add" draggable=false src="https://www.freepnglogos.com/uploads/plus-icon/plus-icon-plus-svg-png-icon-download-1.png">
                    <img id = "remove" draggable=false src="https://www.freepnglogos.com/uploads/plus-icon/plus-icon-plus-svg-png-icon-download-1.png">
                </div>
                <div class="bottom">
                    <img id = "move" draggable=false src="https://cdn-icons-png.flaticon.com/512/60/60564.png">
                    <img id = "add" draggable=false src="https://www.freepnglogos.com/uploads/plus-icon/plus-icon-plus-svg-png-icon-download-1.png">
                </div>
            </div>
            `

			Tier.elm = outerDiv
		}
		Tier.elm.querySelector(".label-holder").setAttribute("style", "background-color: " + (Colors[i] ?? "white") + ";")
		tierlist.appendChild(Tier.elm);
	})
}

CreateTiers()



function moveForward(arr, index, positions) {

	let curvalue = arr[index]
	let posindex = positions == 1 ? (index + 1) % arr.length : (index == 0 ? arr.length - 1 : index - 1)
	let nextvalue = arr[posindex]

	console.table(index, arr.length, curvalue, posindex, nextvalue)

	arr[index] = nextvalue;
	arr[posindex] = curvalue;
}

function CancelSelection() {
	itemsElms.forEach(elm => {
		elm.setAttribute("inactive", "false");
	})
	selected = undefined
	art.querySelector("img").setAttribute("src", "")
}

function IsAnItem(check) {
	if (itemsElms.includes(check))
		return (1);
	Tiers.forEach(Tier => {
		if (Tier.elm.contains(check))
			return (2);
	})
	return (0);
}

function HandleControl(elem) {
	console.log("clicked")
	if (elem.id == "remove") {
		if (Tiers.length == 1)
			return;
		else {
			Tiers.some((Tier, i) => {
				if (Tier.elm.contains(elem)) {
					Tier.elm.querySelectorAll(".tiercontent > .item").forEach(child => {
						items.appendChild(child)
					})
					Tier.elm.remove();
					Tiers.splice(i, 1);
					CreateTiers();
					return true;
				}
				return false;
			});
		}
	}
	else if (elem.id == "move") {
		if (elem.parentElement.className == "top") {
			Tiers.some((Tier, i) => {
				if (Tier.elm.contains(elem)) {
					moveForward(Tiers, i, -1);
					CreateTiers();
					return true;
				}
				return false;
			});
		}
		else if (elem.parentElement.className == "bottom") {
			Tiers.some((Tier, i) => {
				if (Tier.elm.contains(elem)) {
					moveForward(Tiers, i, 1);
					CreateTiers();
					return true;
				}
				return false;
			});
		}
	}
	else if (elem.id == "add")
	{
		if (elem.parentElement.className == "top") {
			Tiers.some((Tier, i) => {
				if (Tier.elm.contains(elem)) {
					Tiers.splice(i, 0, {Title:"NEW", Color: "", Content: []});
					CreateTiers();
					return true;
				}
				return false;
			});
		}
		else if (elem.parentElement.className == "bottom") {
			Tiers.some((Tier, i) => {
				if (Tier.elm.contains(elem)) {
					Tiers.splice(i + 1, 0, {Title:"NEW", Color: "", Content: []});
					CreateTiers();
					return true;
				}
				return false;
			});
		}
	}
}

addEventListener('click', (event) => {
	if (!event.target || !event.target.parentElement)
		return ;
	if (event.target.parentElement.className &&
		(event.target.parentElement.className == "top"
			|| event.target.parentElement.className == "bottom")) {
		HandleControl(event.target)
		return;
	}
	if (IsAnItem(event.target.parentElement) && !selected) {
		itemsElms.forEach(elm => {
			if (elm.querySelector("img") != event.target)
				elm.setAttribute("inactive", "true");
			else
				elm.setAttribute("inactive", "false");
		})
		selected = event.target
		art.querySelector("img").setAttribute("src", "")
		art.querySelector("img").setAttribute("src", cdata[event.target.parentElement.getAttribute("index")].Art)
	}
	else if ((tierlist.contains(event.target) || items.contains(event.target)) && selected) {
		let tierlistcontains = tierlist.contains(event.target)
		if (tierlist.contains(event.target))
			Tiers.forEach(Tier => {
				if (Tier.elm.contains(event.target)) {
					if (!IsAnItem(event.target.parentElement))
						Tier.elm.querySelector(".tiercontent").appendChild(selected.parentElement)
					else
						Tier.elm.querySelector(".tiercontent").insertBefore(selected.parentElement, event.target.parentElement)
				}
			})
		else
			items.appendChild(selected.parentElement)
		CancelSelection()
	}
	else
		CancelSelection()
	return false;
	if (itemsElms.includes(event.target.parentElement) && event.target.tagName == "IMG" && event.target != selected) {
		itemsElms.forEach(elm => {
			if (elm.querySelector("img") != event.target)
				elm.setAttribute("inactive", "true");
			else
				elm.setAttribute("inactive", "false");
		})
		selected = event.target
		art.querySelector("img").setAttribute("src", "")
		art.querySelector("img").setAttribute("src", cdata[event.target.parentElement.getAttribute("index")].Art)
	}
	else if (tierlist.contains(event.target) && selected) {
		Tiers.forEach(Tier => {
			if (Tier.elm.contains(event.target)) {
				items.removeChild(selected.parentElement)
				Tier.elm.querySelector(".tiercontent").appendChild(selected.parentElement)
			}
		})
		CancelSelection()
	}
	else if (selected && items.contains(event.target)) {
		Tiers.forEach(Tier => {
			if (Tier.elm.contains(selected)) {
				Tier.elm.removeChild(selected.parentElement)
				items.appendChild(selected.parentElement)
			}
		})
		CancelSelection()
	}
	else
		CancelSelection()
})