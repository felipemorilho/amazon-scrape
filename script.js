
// Function to use a keyword to scrape Amazon Data based on user input
async function scrapeAmazon() {

    const keywordInput = document.getElementById('keyword');
    const keyword = keywordInput.value.trim(); 
    const resultsContainer = document.getElementById('results')
  
    try {

        // The keyword must not be blank
        if(keyword === '') {

            resultsContainer.innerHTML = 'Keyword must not be blank';
            return;

        }

        //Async fetch request to the server API 
        const response = await fetch(`http://localhost:3000/api/scrape?keyword=${encodeURIComponent(keyword)}&page=1`);           
        const data = await response.json();
           
        // Making sure that the result are clear befora showing them
        resultsContainer.innerHTML = '';

        // Logic to show 3 itens per row
        for (let i = 0; i < data.length; i += 3) {

            const rowDiv = document.createElement('div');
            rowDiv.className = 'row';

            for (let j = i; j < i + 3 && j < data.length; j++) {

                const product = data[j];

                const productDiv = document.createElement('div');
                productDiv.className = 'product';

                productDiv.innerHTML = `<strong>${product.title}</strong><br><br>
                                        Rating: ${product.rating}<br><br>
                                        Reviews: ${product.reviews}<br><br>
                                        <img src="${product.imageURL}" alt="${product.title}" width="100"><br><br>`;

                //Append result to div
                rowDiv.appendChild(productDiv);

            }

            //Append results to result class
            resultsContainer.appendChild(rowDiv);
        }

        // Error case fetch doesn't work
    } catch (error) {

      console.error(error);
      resultsContainer.innerHTML = 'Error fetching data from the server';

    }
  }
  