import { WishlistElementHeadless } from "https://cdn.jsdelivr.net/npm/@appmate/wishlist@4.27.1/wishlist-element-headless.js";

class WishlistButtonHeadless extends WishlistElementHeadless {
  getStateConfig() {
    return {
      productInfo: true,
    };
  }

  getEventConfig() {
    return {
      "click": this.handleClick,
    };
  }

  handleClick() {
    if (this.productInfo.inWishlist) {
      return this.app.removeWishlistItem(this.productInfo);
    } else {
      return this.app.addWishlistItem(this.productInfo);
    }
  }

  updated() {
    this.host.classList.toggle("wk-selected", this.productInfo.inWishlist);

    const textElement = this.host.querySelector(".wk-text");
    textElement.innerText = this.getText();
  }

  getText() {
    if (this.productInfo.inWishlist) {
      return "Remove from Wishlist";
    }
    return "Add to Wishlist";
  }
};

window.headlessElements.define("wishlist-button-headless", WishlistButtonHeadless);