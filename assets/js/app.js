"use strict";

(() => {
    const searchInput = document.getElementById("searchInput");
    const searchButton = document.getElementById("searchButton");
    const allButton = document.getElementById("allButton");
    const statisticsDiv = document.getElementById("statistics");
    const countriesTableBody = document.querySelector("#countriesTable tbody");
    const regionTableBody = document.querySelector("#regionTable tbody");
    const languagesTableBody = document.querySelector("#languagesTable tbody");

    // Function to display countries and statistics
    const displayCountries = (countries) => {
        countriesTableBody.innerHTML = "";
        regionTableBody.innerHTML = "";
        languagesTableBody.innerHTML = "";

        const regionCount = {};
        const languagesCount = {}; // To count languages
        const countryLanguages = {}; // To store languages per country

        let totalPopulation = 0;

        countries.forEach((country) => {
            const { name, population, region, languages } = country;

            totalPopulation += population;

            // Store languages per country
            if (languages) {
                countryLanguages[name.common] = Object.values(languages);
                Object.values(languages).forEach((language) => {
                    languagesCount[language] = (languagesCount[language] || 0) + 1;
                });
            }

            const row = `
                <tr>
                    <td>${name.common}</td>
                    <td>${population.toLocaleString()}</td>
                    <td>${region}</td>
                </tr>
            `;
            countriesTableBody.innerHTML += row;

            // Count regions
            regionCount[region] = (regionCount[region] || 0) + 1;
        });

        // Display global statistics
        const avgPopulation = totalPopulation / countries.length;
        statisticsDiv.innerHTML = `
            <p>Total countries: ${countries.length}</p>
            <p>Total population: ${totalPopulation.toLocaleString()}</p>
            <p>Average population: ${avgPopulation.toFixed(2)}</p>
        `;

        // Display regions dynamically
        Object.keys(regionCount).forEach((region) => {
            const row = `
                <tr>
                    <td>${region}</td>
                    <td>${regionCount[region]}</td>
                </tr>
            `;
            regionTableBody.innerHTML += row;
        });

        // Display languages and their counts dynamically
        Object.keys(languagesCount).forEach((language) => {
            const row = `
                <tr>
                    <td>${language}</td>
                    <td>${languagesCount[language]}</td>
                </tr>
            `;
            languagesTableBody.innerHTML += row;
        });

        return { countryLanguages, languagesCount }; // Return the mapping of countries and their languages
    };

    // Function to fetch countries
    const fetchCountries = (url) => {
        return fetch(url)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch data");
                }
                return response.json();
            })
            .catch((error) => {
                console.error("Error:", error);
                console.warn("Failed to load countries.");
            });
    };

    // Button to display all countries
    allButton.addEventListener("click", () => {
        fetchCountries("https://restcountries.com/v3.1/all")
            .then((countries) => {
                displayCountries(countries);
            })
            .catch((error) => console.warn("Error fetching all countries:", error));
    });

    // Button to search for a country
    searchButton.addEventListener("click", () => {
        const searchQuery = searchInput.value.trim();
        if (!searchQuery) {
            alert("Please enter a country name");
            return;
        }
        const url = `https://restcountries.com/v3.1/name/${searchQuery}`;

        fetchCountries(url)
            .then((countries) => {
                const { countryLanguages, languagesCount } = displayCountries(countries);

                // Display specific country language details
                if (countries.length > 0) {
                    const countryName = countries[0].name.common;
                    const languagesSpoken = countryLanguages[countryName];
                    let languagesMessage = `Languages spoken in ${countryName}: ${languagesSpoken.join(", ")}`;

                    // Display how many other countries use the same language
                    languagesSpoken.forEach((language) => {
                        const otherCountriesCount = languagesCount[language] - 1; // Exclude the current country
                        languagesMessage += `<br>Other countries that speak ${language}: ${otherCountriesCount}`;
                    });

                    statisticsDiv.innerHTML += `<p>${languagesMessage}</p>`;
                }
            })
            .catch((error) => console.warn("Error fetching country by name:", error));
    });
})();
