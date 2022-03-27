import {ethers} from "ethers";
import {InfluxDB, Point} from '@influxdata/influxdb-client'
import 'dotenv/config'

async function main() {

  let lastEthBlockTime;
  let lastPolygonBlockTime;
  let lastPolBlock;
  let lastEthBlock;
  let blockDelta = 0;

  const polygonKey = process.env.XMEV_POLYGON_KEY;
  const ethereumKey = process.env.XMEV_ETHEREUM_KEY;
  const token = process.env.XMEV_INFLUX_TOKEN;
  const org = process.env.XMEV_INFLUX_ORG;
  const transmit = process.env.XMEV_TRANSMIT;
  const bucket = 'xmev'

  const ethereumProvider = new ethers.providers.AlchemyProvider(null, ethereumKey);
  const polygonProvider = new ethers.providers.AlchemyProvider(null, polygonKey);

  const client = new InfluxDB({url: 'https://europe-west1-1.gcp.cloud2.influxdata.com', token: token})
  const writeApi = client.getWriteApi(org, bucket)
  writeApi.useDefaultTags({host: 'xmev-capture'})

  ethereumProvider.on('block', (block) => {
    lastEthBlockTime = Date.now();
    lastEthBlock = block;
    const ethBlock = new Point('ethereum_timestamps')
      .tag("block", block)
      .intField('timestamp', lastEthBlockTime)
    let timeDelta = (lastEthBlockTime - lastPolygonBlockTime);
    const delta_blocks = new Point('delta_blocks')
      .tag("eth_block", block)
      .tag("pol_block", lastPolBlock)
      .tag("timestamp", lastEthBlockTime)
      .floatField("delta", blockDelta)
    if (!isNaN(timeDelta)) {
      const delta_time = new Point('delta_block_time')
        .tag("eth_block", block)
        .tag("pol_block", lastPolBlock)
        .tag("timestamp", lastEthBlockTime)
        .floatField("delta", timeDelta)
      if (transmit == "TRUE") {
        writeApi.writePoints([ethBlock, delta_time, delta_blocks]);
      }
    } else {
      if (transmit == "TRUE") {
        writeApi.writePoints([ethBlock, delta_blocks]);
      }
    }
    console.log("ETHEREUM ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    console.log(`New Eth Block: ${block}`);
    console.log(`Time delta: ${timeDelta}`);
    console.log("Writing point to InfluxDB");
    console.log(ethBlock);
    if (!isNaN(timeDelta)) {
      console.log(timeDelta);
    }
    console.log(delta_blocks);
    console.log("ETHEREUM ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n");
    blockDelta = 0;
  });

  polygonProvider.on('block', (block) => {
    lastPolygonBlockTime = Date.now();
    lastPolBlock = block;
    blockDelta += 1;
    const polBlock = new Point("polygon_timestamps")
      .tag("block", block)
      .intField('timestamp', lastPolygonBlockTime)
    if (transmit == "TRUE") {
      writeApi.writePoint(polBlock);
    }
    console.log("POLYGON ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    console.log(`New Polygon Block: ${block}`);
    console.log(`Block delta: ${blockDelta}`);
    console.log("Writing point to InfluxDB");
    console.log(polBlock);
    console.log("POLYGON ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n");
  });
  if (transmit == "TRUE") {
    await flushValues(writeApi);
  } else {
    console.log("Transmit is set to OFF");
  }
}
async function flushValues(writeApi) {
  await writeApi.flush(true);
  console.log('Flushed values to InfluxDB');
  setTimeout(flushValues, 1000 * 10, writeApi);
}


main()
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
