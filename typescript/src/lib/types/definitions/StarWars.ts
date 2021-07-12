export const enum Resource {
	Films = 'films',
	People = 'people',
	Planets = 'planets',
	Species = 'species',
	Starships = 'starships',
	Vehicles = 'vehicles'
}

export interface EmbedTitles {
	[Resource.Films]: {
		characters: string;
		director: string;
		episodeId: string;
		planets: string;
		producers: string;
		releaseDate: string;
		species: string;
		starships: string;
		vehicles: string;
	};
	[Resource.People]: {
		appearedInFilms: string;
		eyeColours: string;
		gender: string;
		hairColours: string;
		height: string;
		homeworld: string;
		mass: string;
		ownedStarShips: string;
		ownedVehicles: string;
		skinColours: string;
		species: string;
		yearOfBirth: string;
	};
	[Resource.Planets]: {
		appearedInFilms: string;
		averageSentientPopulation: string;
		climate: string;
		diameter: string;
		gravity: string;
		gravityBody: string;
		orbitalPeriod: string;
		residents: string;
		rotationPeriod: string;
		surfaceWaterPercentage: string;
		terrains: string;
	};
	[Resource.Species]: {
		appearedInFilms: string;
		averageHeight: string;
		averageLifespan: string;
		classification: string;
		designation: string;
		eyeColours: string;
		hairColours: string;
		homeworld: string;
		knownPeopleOfSpecies: string;
		skinColours: string;
	};
	[Resource.Starships]: {
		amountOfPassengers: string;
		appearedInFilms: string;
		cargoCapacity: string;
		consumables: string;
		costInCredits: string;
		crew: string;
		hyperdriveRating: string;
		length: string;
		manufacturer: string;
		maximumAtmospheringSpeed: string;
		megalightsTravelSpeed: string;
		model: string;
		pilots: string;
		starshipClass: string;
	};
	[Resource.Vehicles]: {
		amountOfPassengers: string;
		appearedInFilms: string;
		cargoCapacity: string;
		consumables: string;
		costInCredits: string;
		crew: string;
		length: string;
		manufacturer: string;
		maximumAtmospheringSpeed: string;
		model: string;
		pilots: string;
		vehicleClass: string;
	};
}
