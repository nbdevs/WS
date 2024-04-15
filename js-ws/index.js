const puppeteer = require('puppeteer');
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

var leagues = ["Spanish La Liga", "German Bundesliga", "Premier League", "Italian Serie A", "French Ligue 1"];
var matchData = [{ 0: [] }, { 1: [] }, { 2: [] }, { 3: [] }, { 4: [] }];

const url = "https://m.skybet.com/football/competitions";

evalLeagueName = (leagueDict, arrayOfLeagueNames) => { // function for determining the type of 
    for (var j = 0; j < arrayOfLeagueNames.length; j++) { // loop through entire array
        if (arrayOfLeagueNames[j] in leagueDict) { // if there is a match 
            return arrayOfLeagueNames[j];
        }
    }
}

recordWriter = async (csvWriter, matchData, leagues) => {

    await csvWriter.writeRecords(matchData)
    .then(() => {
        console.log(`Extracting ${leagues} Data...`)
    })
    .catch((err) => {
        console.log("Failed data extraction", err)
    });
}

dataExtractor = async (pagePL) => {

    data = await pagePL.evaluate(() => {
        
        const bigTable = document.querySelectorAll("li._1h3cgic");
        const oddsArr = [];

        bigTable.forEach(table => {
            var date = table.querySelector("div._139dja0NaN > div._zxe9qt");
            var leagueName = table.querySelector("table > tbody > tr > th"); // selecting date of fixture
            const teamInfo = Array.from(table.querySelectorAll("div:nth-child(2) > table > tbody > tr > th > a > div")); // selecting column containing rows of team information/ match timing

            // array initialisation
            const homeTeam = [];
            const awayTeam = [];
            const matchTime = [];

            for (let i = 0; i < teamInfo.length; i++) {

                if (i % 3 == 0) {
                    var text = teamInfo[i].innerText;
                    homeTeam.push(text);
                }
                else if ((i % 3) - 1 == 0) {
                    var text = teamInfo[i].innerText;
                    awayTeam.push(text);
                }
                else if ((i % 3) - 2 == 0) {
                    var text = teamInfo[i].innerText;
                    matchTime.push(text);
                }
            }

            const oddsInfo = Array.from(table.querySelectorAll("span._l437sv")); // selecting all rows within table containing odds 

            // array initialisation 
            const homeOdds = [];
            const drawOdds = [];
            const awayOdds = [];

            for (let i = 0; i < oddsInfo.length; i++) { // array of betting odds per table 
                if (i % 3 == 0) {
                    homeOdds.push(oddsInfo[i].innerText); // push value of home odds into array 
                }
                else if ((i % 3) - 1 == 0) {
                    drawOdds.push(oddsInfo[i].innerText); // push value of draw odds into array 
                }
                else if ((i % 3) - 2 == 0) {
                    awayOdds.push(oddsInfo[i].innerText); // push value of away odds into array 
                }
            }

            for (let i = 0; i < awayOdds.length; i++) { // final array of key value pairs
                
                oddsArr.push({
                    home_team: homeTeam[i],
                    away_team: awayTeam[i],
                    home_win_odds: homeOdds[i],
                    draw_odds: drawOdds[i],
                    away_win_odds: awayOdds[i],
                    match_time: matchTime[i],
                    match_date: date.innerText,
                    league_name: leagueName.innerText
                })
            }
        })
        return oddsArr;
    }) 
    return data;
}

tableOpener = async (leagueUrl, browser) => { // handles data collection for each league 

    var pagePL = await browser.newPage(); // open new page 
    await pagePL.goto(leagueUrl, { waitUntil: "networkidle2" });

    await pagePL.exposeFunction("loggerDebug", console.log.bind(console)); // exposing browser log for debugging

    const tabledData = await pagePL.evaluate(async () => { // async method for ensuring button 

        var tables = document.querySelector("ul._n9hnfu"); // entire collection of tables 
        const buttons = tables.querySelectorAll("div > div._1ufbuwwo > div"); 

        waitFor = (delay) => { // defining local wait function 
            return new Promise(resolve => setTimeout(resolve, delay));
        }

        for (let j = 1; j < buttons.length; j++) { // click through all table buttons on the page 
            await buttons[j].click();
            await waitFor(1000);
            }
        })

    data = await dataExtractor(pagePL);
    return data;
}

ServerStart = async () => { // async function to handle uncertainty of time for queries

    var browser = await puppeteer.launch({ /*headless: false */ });
    const page = await browser.newPage(); // open new page 
    await page.goto(url, { waitUntil: "networkidle2" });

    // grabs match fixtures 
    const lessCookies = await page.evaluate(() => {
        const button = document.querySelector("#onetrust-reject-all-handler"); // remove cookies 
        button.click();
    })

    const leagueTables = await page.$$eval("._cob6xp", leagueTables => { // selecting all elements corresponding to football divisions/leagues
        leagueDict = {};
        const names = leagueTables.map(leagueTables => leagueTables.innerText); // mapping league names to text for dict
        const links = leagueTables.map(leagueTables => leagueTables.href); // mapping league link urls for dict 

        for (var i = 0; i < leagueTables.length; i++) { // initialising dict
            leagueDict[names[i]] = links[i];
        }
        return leagueDict;
    })

    for (let i = 0; i < leagues.length; i++) { //loop through all leagues and collect data 

        if (leagues[i] == "Premier League") { // premier league pathway 
            var leagueUrl = leagueTables[leagues[2]]; // string for premier league 
            let oddsDict = await tableOpener(leagueUrl, browser);
            matchData[0] = oddsDict;
        }
        else if (leagues[i] == "German Bundesliga") { // bundesliga pathway
            var leagueUrl = leagueTables[leagues[1]]; // string for bundesliga league
            let oddsDict = await tableOpener(leagueUrl, browser);
            matchData[1] = oddsDict;
        }
        else if (leagues[i] == "French Ligue 1") {// ligue 1
            var leagueUrl = leagueTables[leagues[4]]; // string for ligue 1 
            let oddsDict = await tableOpener(leagueUrl, browser);
            matchData[2] = oddsDict;
        }
        else if (leagues[i] == "Italian Serie A") {// serie a
            var leagueUrl = leagueTables[leagues[3]]; // string for serie a
            let oddsDict = await tableOpener(leagueUrl, browser);
            matchData[3] = oddsDict;
        }
        else if (leagues[i] == "Spanish La Liga") {// la liga 
            var leagueUrl = leagueTables[leagues[0]]; // string for la liga
            let oddsDict = await tableOpener(leagueUrl, browser);
            matchData[4] = oddsDict; 
        }
    }

  await browser.close();

    const csvWriter = createCsvWriter({ // defining csv structure 
        path: './files/betting_odds.csv', 
        header: [
            { id: 'home_team', title: 'home_team' },
            { id: "away_team", title: 'away_team' },
            { id: "home_win_odds", title: 'home_win_odds' },
            { id: "draw_odds", title: 'both_draw_odds' },
            { id: "away_win_odds", title: 'away_win_odds' },
            { id: "match_time", title: "match_time" },
            { id: "match_date", title: "match_date" },
            {id: "league_name", title: "league_name" }
        ]
    })

    for (var i = 0; i < matchData.length; i++) {

        //recursive paths for handling different league data extraction with function calls. 
        if(i==0){
            await recordWriter(csvWriter, matchData[i], leagues[2]);
        }
        else if (i==1){
            await recordWriter(csvWriter, matchData[i], leagues[1]);
        }
        else if (i==2){
            await recordWriter(csvWriter, matchData[i], leagues[4]);
        }
        else if (i ==3){
            await recordWriter(csvWriter, matchData[i], leagues[3]);
        }
        else if (i ==4){
            await recordWriter(csvWriter, matchData[i], leagues[0]);
        }
    }

    return matchData;
}

main = async () => {
    const record = await ServerStart();
}

main();

