import { Injectable } from '@angular/core';
import { AccountId, PrivateKey, Client, TokenId } from '@hashgraph/sdk';

@Injectable({
  providedIn: 'root'
})
export class TradingBotService {
  private client: Client;
  // Retaining the on-chain token IDs for possible swap functionality.
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
    }, 45000); // every 45 seconds
  }

  stopAutoTrade() {
    clearInterval(this.autoTradeInterval);
    this.autoTradeInterval = null;
    this.initialPrice = null;
    console.log('🛑 Auto trading stopped.');
  }

  private async getSaucePriceInUSD(): Promise<number> {
    try {
      // Modified API call to use 'saucerswap' as the token id, which should reflect your CoinGecko setup.
      const url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=saucerswap,usd-coin&sparkline=false';
      const response = await fetch(url);
      const data = await response.json();

      // Find the token data using the updated id 'saucerswap'
      const sauceData = data.find((token: any) => token.id === 'saucerswap');

      if (!sauceData || !sauceData.current_price) {
        throw new Error('SAUCE price data not available');
      }

      return sauceData.current_price;
    } catch (error) {
      console.error('❌ Failed to fetch live SAUCE price:', error);
      return this.initialPrice ?? 1.0; // fallback to last known or dummy value
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
