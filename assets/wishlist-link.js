import { WishlistElementHeadless } from "https://cdn.jsdelivr.net/npm/@appmate/wishlist@4.25.18/wishlist-element-headless.js";

class WishlistLinkHeadless extends WishlistElementHeadless {
  getStateConfig() {
    return {
      wishlist: true,
    };
  }

  getWishlistUrl() {
    if (this.app.settings.loginRequired) {
      return this.app.routes.accountLoginUrl;
    }
    return this.app.routes.wishlistUrl;
  }

  updated() {
    const numItems = this.wishlist ? this.wishlist.numItems : 0;

    this.host.href = this.getWishlistUrl();
    this.host.classList.toggle("wk-selected", numItems > 0);
    this.host.querySelector(".wk-counter").innerText = numItems;
  }
};

window.headlessElements.define("wishlist-link-headless", WishlistLinkHeadless);