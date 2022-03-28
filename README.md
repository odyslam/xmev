# xMEV, an apt exploration

This is a small exploration on the xMEV opportunities between Polygon and Ethereum. It's a data analysis exercise on a few parameters that I believe are crucial in being able to offer xMEV opportunities to searchers, a-la-Flashbots. 

This repository is a draft and accompanies a draft blog-post. Everything will be released in good time.


## Explore

- `data/`: Data from the capturing script in `.csv`. The correct data are the ones with the name `_correct`.
- `capture/`: The capturing script that runs on a remote server and captures data for our analysis. It's written in Javascript and pushes the data to InfluxDB for easy visualization and explort
- `xmev.ipynb`: The main corpus of the analysis, in the form of a Jupyter Notebook. Mainly some statistical analysis and some forecasting.

