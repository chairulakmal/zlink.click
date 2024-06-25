const config = {
  previousHalvingBlock: 1046400,
  nextHalvingBlock: 2726400,
  maxSupply: 21000000,
  blockReward: 3.125,
  blocksPerDay: 1152,
  api: [
    "https://api.coingecko.com/api/v3/simple/price?ids=zcash&vs_currencies=usd&include_market_cap=false&include_24hr_vol=false&include_24hr_change=true&include_last_updated_at=false&precision=5&c",
    "https://api.blockchair.com/zcash/stats",
    "https://data.messari.io/api/v1/assets/zcash/metrics",
    "https://corsproxy.io/?" + encodeURIComponent("https://mainnet.zcashexplorer.app/api/v1/blockchain-info"),
    "https://api.3xpl.com/?token=3A0_t3st3xplor3rpub11cb3t4efcd21748a5e",
    //"https://raw.githubusercontent.com/ZecHub/zechub-wiki/main/public/data/sprout_supply.json",
    //"https://raw.githubusercontent.com/ZecHub/zechub-wiki/main/public/data/sapling_supply.json",
    //"https://raw.githubusercontent.com/ZecHub/zechub-wiki/main/public/data/orchard_supply.json",
  ],
};

const domElements = {
  price: document.querySelector("#txt-price"),
  marketCap: document.querySelector("#txt-market-cap"),
  diluitedMarketCap: document.querySelector("#txt-diluited-market-cap"),
  priceChange24: document.querySelector("#txt-price-change24"),
  currentBlock: document.querySelector("#txt-current-block"),
  toHalving: document.querySelector("#txt-to-halving"),
  blockReward: document.querySelector("#txt-block-reward"),
  dailyZec: document.querySelector("#txt-daily-zec"),
  inflation: document.querySelector("#txt-inflation"),
  difficulty: document.querySelector("#txt-difficulty"),
  timer: document.querySelector("#txt-timer"),
  halvingDate: document.querySelector("#txt-halving-date"),
  mempool: document.querySelector("#txt-mempool"),
  transparentPool: document.querySelector("#txt-tpool"),
  sproutPool: document.querySelector("#txt-zcpool"),
  saplingPool: document.querySelector("#txt-zspool"),
  orchardPool: document.querySelector("#txt-opool"),
  shieldedPool: document.querySelector("#txt-shieldedpool"),
  shieldedPercent: document.querySelector("#txt-shieldedpercent"),
  totalSupply: document.querySelector("#txt-total-supply"),
};

let transparent, shielded, percentShielded, sprout, sapling, orchard, totalSupply, currentBlock, dailyZec, yearlyZec, blocksPerYear, inflationRate, difficulty, mempool, blocksToHalving, secsToHalving, countDownDate, price, priceChange24, marketCap, diluitedMarketCap;

(async function fetchAllData() {
  try {
    const fetchData = async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API request error: ${response.status} ${response.statusText}`);
      }
      return response.json();
    };

    const [cgk, bhr, msr, zex, xpl] = await Promise.all(config.api.map(fetchData));
    currentBlock = bhr.data.blocks;
    difficulty = bhr.data.difficulty;
    mempool = bhr.data.mempool_transactions;
    blocksToHalving = config.nextHalvingBlock - currentBlock;
    secsToHalving = blocksToHalving * 75;
    countDownDate = new Date().getTime() + secsToHalving * 1000;
    sprout = zex.valuePools[1].chainValue;
    sapling = zex.valuePools[2].chainValue;
    orchard = zex.valuePools[3].chainValue;
    shielded = sprout + sapling + orchard;
    totalSupply = msr.data.supply.circulating;
    transparent = zex.valuePools[0].chainValue;
    percentShielded = transparent !== 0 ? (shielded / transparent) * 100 : 0;
    price = cgk.zcash.usd;
    priceChange24 = cgk.zcash.usd_24h_change;
    marketCap = price * totalSupply;
    diluitedMarketCap = price * config.maxSupply;
    blocksPerYear = config.blocksPerDay * 365;
    dailyZec = config.blocksPerDay * config.blockReward;
    yearlyZec = blocksPerYear * config.blockReward;
    inflationRate = (yearlyZec / totalSupply) * 100;

    (function updateDOM() {
      domElements.halvingDate.innerHTML = new Date(countDownDate).toDateString();
      domElements.price.innerHTML = price.toFixed(2) + " $";
      domElements.marketCap.innerHTML = Math.floor(marketCap).toLocaleString("en-US") + " $";
      domElements.diluitedMarketCap.innerHTML = Math.floor(diluitedMarketCap).toLocaleString("en-US") + " $";
      domElements.blockReward.innerHTML = config.blockReward.toLocaleString("en-US") + " ZEC";
      domElements.dailyZec.innerHTML = dailyZec.toLocaleString("en-US") + " ZEC";
      domElements.inflation.innerHTML = inflationRate.toFixed(2) + "%";
      domElements.toHalving.innerHTML = blocksToHalving.toLocaleString("en-US");
      domElements.difficulty.innerHTML = difficulty.toLocaleString("en-US");
      domElements.currentBlock.innerHTML = currentBlock.toLocaleString("en-US");
      domElements.mempool.innerHTML = mempool.toLocaleString("en-US") + " TXs";
      domElements.transparentPool.innerHTML = Math.floor(transparent).toLocaleString("en-US") + " ZEC";
      domElements.sproutPool.innerHTML = Math.floor(sprout).toLocaleString("en-US") + " ZEC";
      domElements.saplingPool.innerHTML = Math.floor(sapling).toLocaleString("en-US") + " ZEC";
      domElements.orchardPool.innerHTML = Math.floor(orchard).toLocaleString("en-US") + " ZEC";
      domElements.totalSupply.innerHTML = Math.floor(totalSupply).toLocaleString("en-US") + " ZEC";
      domElements.shieldedPool.innerHTML = Math.floor(shielded).toLocaleString("en-US") + " ZEC";
      domElements.shieldedPercent.innerHTML = percentShielded.toFixed(2) + "%";
      domElements.priceChange24.innerHTML = priceChange24.toFixed(2) + "%";
    })();

    (function startTimer() {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const distance = countDownDate - now;
        if (distance < 0) {
          clearInterval(interval);
          alert("Reach @an_Olek on telegram to update the countdown.");
          return;
        }
        const days = Math.floor(distance / (1000 * 60 * 60 * 24)).toString().padStart(2, "0");
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, "0");
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, "0");
        const seconds = Math.floor((distance % (1000 * 60)) / 1000).toString().padStart(2, "0");

        domElements.timer.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s to go`;
      }, 1000);
    })();

    // Halving progress data
    const totalBlocks = config.nextHalvingBlock - config.previousHalvingBlock;
    const completedBlocks = currentBlock - config.previousHalvingBlock;
    const progressPercent = (completedBlocks / totalBlocks) * 100;

    // Progress bar
    const progressBar = document.querySelector('#progress');
    if (progressBar) {
      progressBar.style.width = progressPercent + '%';
    }

    // Percentage
    document.querySelector('#progress-label').innerHTML = progressPercent.toFixed(2) + '%';

  } catch (error) {
    console.log("An error occurred:", error);
  }
})();