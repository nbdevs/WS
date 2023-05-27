from datetime import datetime
    
class Scraper:
    """ Scraper class for pulling data from API endpoint."""
    
    def __init__(self, *args):
        
        self.AAPL = args[0]
        self.MSFT = args[1]
        self.IBM = args[2]
        self._api_key = "ZINP07mrRU83gnwFwKvc5q8iVQb0FUM5"
        
    def get_api_key(self) -> str:
        """ u87786returns api key which is stored as a private variable from this class for accessor classes"""
        
        api_key = self._api_key
        
        return api_key
    
    def pull_stock_data(self, tick, multiplier, timespan, date_to, date_from):
        """ 5 minute data from 01-30 jan 2022.
        Two extra variables passed are firstly tick which refers to stock name, and duration which refers to the allocated duration of data aggregation."""
        
        import requests as r 
 
        # user and secret initialisation
        user = 'Bearer'
        api_key = self.get_api_key()
        
        # parsing request url
        url = "https://api.polygon.io/v2/aggs/ticker/{0}/range/{1}/{2}/{3}/{4}?adjusted=true&sort=asc&limit=5000".format(tick, multiplier, timespan, date_from, date_to)
        
        # setting session object python3 main.py
        session = r.session()
        

        agg_stock_bars = session.get(url, headers={'Authorization': '{0} {1}'.format(user, api_key), 'Accept': 'text/csv'})
        
        return agg_stock_bars
    
    
  