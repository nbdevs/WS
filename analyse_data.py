class Analyser():

    def __init__(self):
        import os

        self.stocks = ["stock", "MSFT", "IBM"]
        self.pathway = os.getenv('local_path')

        return

    def aapl_data_population(self, timespan, multiplier):
        """ 5 minute data from 20-30 jan 2022.
        Two extra variables passed are firstly tick which refers to stock name, and duration which refers to the allocated duration of data aggregation."""

        from datetime import datetime
        from collect_data import Scraper

        # instantiating scraper class
        scraper = Scraper(self.stocks[0], self.stocks[1], self.stocks[2])

        # variable definitions
        AAPL = scraper.AAPL

        date_from = datetime(2022, 1, 30)
        date_to = datetime(2022, 1, 20)

        date_from_string = date_from.strftime("%Y-%m-%d")
        date_to_string = date_to.strftime("%Y-%m-%d")

        # calling method for stock data
        stock_data = scraper.pull_stock_data(
            AAPL, multiplier, timespan, date_from_string, date_to_string)

        return stock_data

    def msft_data_population(self, timespan):
        """ 1 day data from 01-31 jan 2022.
        Two extra variables passed are firstly tick which refers to stock name, and duration which refers to the allocated duration of data aggregation."""

        from datetime import datetime
        from collect_data import Scraper

        # instantiating scraper class
        scraper = Scraper(self.stocks[0], self.stocks[1], self.stocks[2])

        # variable definitions
        MSFT = scraper.MSFT

        date_from = datetime(2022, 1, 1)
        date_to = datetime(2022, 1, 31)

        date_from_string = date_from.strftime("%Y-%m-%d")
        date_to_string = date_to.strftime("%Y-%m-%d")
        multiplier = int(5)

        # calling method for stock data
        msft_data = scraper.pull_stock_data(
            MSFT, multiplier, timespan, date_from_string, date_to_string)

        return msft_data

    def ibm_data_population(self, timespan):
        """ Two hourly data from 5th feb to 10th feb 2022.
        Two extra variables passed are firstly tick which refers to stock name, and duration which refers to the allocated duration of data aggregation."""

        from datetime import datetime
        from collect_data import Scraper

        # instantiating scraper class
        scraper = Scraper(self.stocks[0], self.stocks[1], self.stocks[2])

        # variable definitions
        IBM = scraper.IBM

        date_from = datetime(2022, 2, 10)
        date_to = datetime(2022, 2, 5)

        date_from_string = date_from.strftime("%Y-%m-%d")
        date_to_string = date_to.strftime("%Y-%m-%d")
        multiplier = int(2)

        # calling method for stock data
        ibm_data = scraper.pull_stock_data(
            IBM, multiplier, timespan, date_from_string, date_to_string)

        return ibm_data

    def write_csv(self, string_array, textfile):
        """ writes out stock data stored within an array into a csv file as output."""
        import csv
        import os

        # variable to store the number of elements within array
        numbers = len(string_array)

        # open textfile for writing
        with open(os.path.join(self.pathway, textfile), 'w') as writefile:
            write = csv.writer(writefile)
            i = 0
            while i < numbers:
                write.writerow(string_array)
                i += 1
        return

    def compute_rolling_average(self, data):
        """ compute 20 minute rolling average 'close' prices and write out as comma separated file (CSV)"""

        import json

        # counter variables
        counter = int(0)
        closing_prices = int(0)

        # integer array to store numbers for average of closing prices.
        var = []

        stock_txt = data.text  # reading response and decoding to string
        stock_json = json.loads(stock_txt)  # loading to json dict object

        for price in stock_json['results']:  # accessing results subarr

            v = price["c"]  # accessing closing price
            closing_prices += v
            counter += 1

            if counter % 4 == 0:  # if current element is multiple of 4
                var.append(closing_prices)
                closing_prices = 0

            elif not counter % 4 == 0:
                continue

        return var

    def daily_stock_prices(self, timespan, interval):

        # resampled for daily data
        stock_data = self.stock_data_population(timespan, interval)

        return stock_data

    def hourly_stock_prices(self, timespan, interval):

        # resampled for hourly data
        stock_data = self.stock_data_population(timespan, interval)

        return stock_data

    def compute_OHLC(self, data):
        """ Computing open, high, low, and close prices for differing time durations."""

        import json

        # integer array to store numbers for average of closing prices.
        var = []

        stock_txt = data.text  # reading response and decoding to string
        stock_json = json.loads(stock_txt)  # loading to json dict object

        for price in stock_json['results']:  # accessing results subarr

            open = price["o"]
            high = price["h"]
            low = price["l"]
            close = price["c"]

            # creating set of ohlc prices
            prices = (open, high, low, close)

            # appending to array
            var.append(prices)

        return var