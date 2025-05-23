import { Injectable } from '@angular/core';
import { AccountId, PrivateKey, Client, TokenId } from '@hashgraph/sdk';

@Injectable({
  providedIn: 'root'
})
export class TradingBotService {
  private client: Client;
  private sauceTokenId = TokenId.fromString('0.0.731861');
  private usdTokenId = TokenId.fromString('0.0.456858');
  private accountId = AccountId.fromString('0.0.8027099'); // Replace with your account ID
  private privateKey = PrivateKey.fromString('b462718c87d11b03f438b23cc3be9f359854e30c65bce5cdf68c72bad04e76d5');
  private initialPrice: number | null = null;
  private autoTradeInterval: any;
  private slippageTolerance = 0.005; // 0.5%

  constructor() {
    this.client = Client.forMainnet(); // Use forTestnet() if testing
    this.client.setOperator(this.accountId, this.privateKey);
  }

  startAutoTrade() {
    console.log('🤖 Auto trading started. Waiting for price checks...');

    this.autoTradeInterval = setInterval(async () => {
      const currentPrice = await this.getSaucePriceInUSD();
      console.log(`📈 Current SAUCE price: $${currentPrice}`);

      if (this.initialPrice === null) {
        this.initialPrice = currentPrice;
        console.log(`📌 Initial price set to $${currentPrice}`);
        return;
      }

      const priceChange = (currentPrice - this.initialPrice) / this.initialPrice;
      console.log(`📊 Price change: ${(priceChange * 100).toFixed(2)}%`);

      if (priceChange >= 0.04) {
        console.log('📈 Price increased ≥ 4% — Swapping SAUCE to USD');
        await this.swapSauceToUSD();
        this.initialPrice = currentPrice;
      } else if (priceChange <= -0.04) {
        console.log('📉 Price decreased ≤ -4% — Swapping USD to SAUCE');
        await this.swapUSDToSauce();
        this.initialPrice = currentPrice;
      } else {
        console.log('⏳ No trades available yet... waiting...');
      }
    }, 60000); // every 60 seconds
  }

  stopAutoTrade() {
    clearInterval(this.autoTradeInterval);
    this.autoTradeInterval = null;
    this.initialPrice = null;
    console.log('🛑 Auto trading stopped.');
  }

  private async getSaucePriceInUSD(): Promise<number> {
    try {
      // Replace these pair IDs with correct ones if needed
      const [sauceHbarRes, hbarUsdcRes] = await Promise.all([
        fetch('https://api.saucerswap.finance/pairs/0.0.731861-0.0.456858'), // SAUCE/WHBAR (placeholder)
        fetch('https://api.saucerswap.finance/pairs/0.0.456858-0.0.456858')  // WHBAR/USDC (placeholder)
      ]);

      const sauceHbar = await sauceHbarRes.json();
      const hbarUsdc = await hbarUsdcRes.json();

      const saucePerHbar = sauceHbar.token0.symbol === 'SAUCE'
        ? parseFloat(sauceHbar.token0_price)
        : 1 / parseFloat(sauceHbar.token1_price);

      const hbarPerUsd = hbarUsdc.token0.symbol === 'HBAR'
        ? 1 / parseFloat(hbarUsdc.token0_price)
        : parseFloat(hbarUsdc.token1_price);

      const saucePerUsd = saucePerHbar * hbarPerUsd;

      if (!saucePerUsd || isNaN(saucePerUsd)) {
        throw new Error('Invalid price calculation');
      }

      return saucePerUsd;
    } catch (error) {
      console.error('❌ Failed to fetch live SAUCE price:', error);
      return this.initialPrice ?? 1.0; // fallback
    }
  }

  private async swapSauceToUSD() {
    console.log('🔄 Executing SAUCE → USD swap...');
    // Implement real token swap logic here (e.g. DEX call)
  }

  private async swapUSDToSauce() {
    console.log('🔄 Executing USD → SAUCE swap...');
    // Implement real token swap logic here (e.g. DEX call)
  }
}
