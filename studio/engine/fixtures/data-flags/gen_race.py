#!/usr/bin/env python3
"""Writes data/race.json: INVENTED sample numbers for the ranking_race fixture (labelled as sample data in its source field)."""
import json, os
here = os.path.dirname(os.path.abspath(__file__))
Y = [1960, 1970, 1980, 1990, 2000, 2010, 2020]
D = {"IT": ("Italy", [10, 9.5, 8, 7, 6, 5.9, 5.9]), "FI": ("Finland", [3, 6, 9, 11, 12, 12, 12]), "NO": ("Norway", [4, 6, 8, 9.5, 9.9, 9.9, 9.9]),
     "NL": ("Netherlands", [5, 6.5, 7, 8, 8.4, 8.4, 8.6]), "DE": ("Germany", [6, 6.8, 7.2, 7.5, 6.5, 6.4, 6.3]), "JP": ("Japan", [0.5, 1, 2, 3, 3.4, 3.5, 3.4]),
     "FR": ("France", [6.5, 6.5, 6, 5.5, 5.2, 4.9, 4.9]), "IE": ("Ireland", [1, 1.5, 2.5, 3.5, 4.5, 5, 5.5]), "GR": ("Greece", [2, 3, 4.5, 5.5, 6, 5.9, 5.6])}
rows = [{"code": c, "name": n, "values": {str(y): v for y, v in zip(Y, vs)}} for c, (n, vs) in D.items()]
json.dump({"title": "Coffee per person", "metric": "Coffee, kilograms per person per year (sample)",
           "source": "SAMPLE DATA for an engine test: invented numbers, not a real dataset", "decimals": 1, "rows": rows},
          open(os.path.join(here, "data", "race.json"), "w"), indent=1)
