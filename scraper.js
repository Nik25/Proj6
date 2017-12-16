	/*****************************************
	   MAIN MODULES
	*****************************************/

	//file system module
	const fs = require("fs"); 
	   
	// npm modules (select packages)
	const scrapeIt = require("scrape-it");
	const json2csv = require("json2csv");

	/*****************************************
	  GLOBAL VARIABLES
	*****************************************/
	//setup for csv & error log

	const csvDir = "./data";
	let csvScrapedShirts = [];

	let today = '', now = ''; // for time & date

	// Url for scraping 
	const mainURL = "http://www.shirts4mike.com/shirts.php";

	// The main shirts page containing individual shirt links.
		let shirtsSeen = {
		shirtList: {
			listItem: ".products li",
			data: {
				links: {
					selector: "a",
					attr: "href"
				}
			}
		}
	};

	// Idividual shirt details
	let eachShirtDetails = {
		details: {
			listItem: "#content",
			data: {
				title: ".shirt-details h1",
				price: ".shirt-details .price",
				imageURL: {
					selector: ".shirt-picture img",
					attr: "src"
				}
			}
		}
	};


	/*****************************************
	 FUNCTIONS
	*****************************************/

	// Crate a directory in case there isn't one that already exists
		function checkDir() {
			if (!fs.existsSync(csvDir)) {
			fs.mkdirSync(csvDir);
			console.log("The directory is created.");
		}
	}

	// Setup for time and date that outputs the local time where the program is run.  

	function dateSetup() {
	    const d = new Date();
	    let mm = d.getMonth()+1;
	    if ( mm < 10 ) { mm = '0' + mm}
	    let dd = d.getDate();
	    if ( dd < 10 ) { dd = '0'+ dd}
	    let hh = d.getHours();
	    if ( hh < 10 ) { hh = '0' + mm}
	    let mn = d.getMinutes();
	    if ( mn < 10 ) { mn = '0'+ mn}
	    let ss = d.getSeconds();
	    if ( ss < 10 ) { ss = '0' + ss}
	    let ms = d.getMilliseconds();
	    now = d.getFullYear()+'-'+ mm +'-'+ dd + ' ' + hh + ':' + mn + ':' + ss + '.' + ms;
	    return now;
	}

	// Specific shirt info is scraped.
	    
	 	function scrapeSite(shirt) {
		 let specificShirtUrl = `http://www.shirts4mike.com/${shirt}`;
		   scrapeIt(specificShirtUrl, eachShirtDetails, (err,page) => {
			const now = dateSetup();
	        // csv shirt data properties are defined 
			 let scrapedShirtInfo = [];
			 scrapedShirtInfo.Title = page.details[0].title.slice(4);
			 scrapedShirtInfo.Price = page.details[0].price;
			 scrapedShirtInfo.ImageURL = page.details[0].imageURL;
			 scrapedShirtInfo.URL = specificShirtUrl;
			 scrapedShirtInfo.Time = now; 
			 csvScrapedShirts.push(scrapedShirtInfo);

			 if (csvScrapedShirts.length === 8) {
				 buildCSV(); 
			 }
		});
	};

	// Function callback for scrapeIt
		function callbackScrapeIt (err, page) {
		if (err) {
			showError(err);
		} else {
			for (var i = 0; i < page.shirtList.length; i++) {
				scrapeSite(page.shirtList[i].links);
			}
		}
	};

	//CSV file gets created.

	function buildCSV () {
	today = dateSetup().substring(0,10);
	    
		const csvHeaders = ['Title', 'Price', 'ImageURL', 'URL', 'Time'];
		const csvShirts = json2csv({data: csvScrapedShirts, fields: csvHeaders});
		const csvPath = csvDir + '/' +  today + '.csv';
		checkDir();
		// create file & save data
		fs.writeFile(csvPath, csvShirts, (err) => {
		if (err) throw err;
		console.log("File successfully saved.");
		});
	};

	// Error log functions to handle error messages.

	 function errorLog (error) {
	  let errorTime = new Date();
	  fs.appendFileSync("scraper-error.log", `[${errorTime}] ${error} \n`);
	}

	function showError (error) {
		errorLog(error);
		console.log("There’s an error and details are logged to scraper-error.log");
	}; 


	/*****************************************
	Program Is Executed
	*****************************************/
	try {
		console.log("The program is working.");
		scrapeIt(mainURL, shirtsSeen, callbackScrapeIt);
	  } catch (error) {
		showError(error);
	  }