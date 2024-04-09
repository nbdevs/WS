from collect_data import Scraper
from analyse_data import Analyser

def main():

    # instantiation of analyser class
    analyser = Analyser()

    # initialising array of time durations
    timespan = ["minute", "hour", "day"]

    # data collection
    # multiplier of 5 for 5 minute interval
    aapl_data = analyser.aapl_data_population(timespan[0], 5)
    ibm_data = analyser.ibm_data_population(timespan[1])
    msft_data = analyser.msft_data_population(timespan[2])

    # q1 - compute rolling average of close prices for 20 min window
    array_list = analyser.compute_rolling_average(aapl_data)
    analyser.write_csv(array_list, 'rolling_average.csv')

    # q2 - compute hourly and daily ohlc prices for day and hour intervals
    stock_data_hourly = analyser.hourly_stock_prices(timespan[1], 1)  # multiplier of 1 for 1 minute interval
    stock_data_daily = analyser.daily_stock_prices(timespan[2], 1)  # multiplier of 1 for 1 minute interval

    array_list_hourly = analyser.compute_OHLC(stock_data_hourly)
    array_list_daily = analyser.compute_OHLC(stock_data_daily)

    analyser.write_csv(array_list_hourly, 'hourly_ohlc.csv')
    analyser.write_csv(array_list_daily, 'daily_ohlc.csv')

    return

if __name__ == "__main__":
    main()
