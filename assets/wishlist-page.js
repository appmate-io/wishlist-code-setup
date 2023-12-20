import { html, repeat } from "https://cdn.jsdelivr.net/gh/lit/dist@2.7.4/all/lit-all.min.js";
import { WishlistElement } from "https://cdn.jsdelivr.net/npm/@appmate/wishlist@4.27.1/wishlist-element.js";
import { ProductFormController } from "https://cdn.jsdelivr.net/npm/@appmate/wishlist@4.27.1/controllers.js";
import "https://cdn.jsdelivr.net/npm/@appmate/wishlist@4.27.1/components/button.js";
import "https://cdn.jsdelivr.net/npm/@appmate/wishlist@4.27.1/components/option-select.js";
import "https://cdn.jsdelivr.net/npm/@appmate/wishlist@4.27.1/components/option-swatches.js";

class WishlistPage extends WishlistElement {
  static get properties() {
    return {
      moveToCart: { type: Boolean, attribute: "move-to-cart" },
      loginCtaMode: { type: String, attribute: "login-cta-mode" },
      variantAutoSelectMode: {
        type: String,
        attribute: "variant-auto-select-mode",
      },
      showVendor: { type: Boolean, attribute: "show-vendor" },
      showProductTitle: { type: Boolean, attribute: "show-product-title" },
      showPrice: { type: Boolean, attribute: "show-price" },
      showShareButton: { type: Boolean, attribute: "show-share-button" },
      showBuyAllButton: { type: Boolean, attribute: "show-buy-all-button" },
      showClearButton: { type: Boolean, attribute: "show-clear-button" },
      ctaButton: { type: String, attribute: "cta-button" },
      productOptions: { type: String, attribute: "product-options" },
      wishlistEmptyLink: { type: String, attribute: "wishlist-empty-link" },
    };
  }

  getStateConfig() {
    return {
      wishlist: true,
    };
  }

  render() {
    if (!this.wishlist) {
      return;
    }

    return html`
      <section class="wk-page">
        ${this.renderHeader()}
        <div class="wk-body">${this.renderWishlistItems()}</div>
      </section>
    `;
  }

  renderHeader() {
    return html`
      <div class="wk-header">
        <h1 class="wk-title">
          ${this.getTranslation("wishlist_page.title")}
        </h1>
        ${this.renderWishlistEmptyCallout()} ${this.renderLoginCallout()}
        ${this.renderControls()}
      </div>
    `;
  }

  renderControls() {
    if (!this.wishlist.items.length) {
      return;
    }
    if (!this.showShareButton && !this.showBuyAllButton && !this.showClearButton) {
      return;
    }

    return html`
      <div class="wk-controls">
        ${this.showShareButton
        ? html`
              <wishlist-share
                data-wishlist-id="${this.wishlist.id}"
              ></wishlist-share>
            `
        : undefined}
        ${this.showBuyAllButton
        ? html`
              <wishlist-add-to-cart
                data-wishlist-id="${this.wishlist.id}"
                .moveToCart=${this.moveToCart}
              ></wishlist-add-to-cart>
            `
        : undefined}
        ${this.showClearButton
        ? html`
              <wishlist-clear
                data-wishlist-id="${this.wishlist.id}"
              ></wishlist-clear>
            `
        : undefined}
      </div>
    `;
  }

  renderWishlistEmptyCallout() {
    if (this.wishlist.items.length) {
      return;
    }

    return html`
      <div class="wk-wishlist-empty-callout">
        <p>
          ${this.getTranslation("wishlist_page.wishlist_empty_callout_html")}
        </p>
        <a href=${this.wishlistEmptyLink} class="wk-callout-cta">
          ${this.getTranslation("wishlist_page.wishlist_empty_cta")}
        </a>
      </div>
    `;
  }

  renderLoginCallout() {
    if (
      this.app.customer ||
      !this.wishlist.isMine ||
      !this.wishlist.items.length
    ) {
      return;
    }
    if (this.loginCtaMode === "DISABLED") {
      return;
    }

    return html`
      <div class="wk-login-callout">
        <p>
          ${this.getTranslation("wishlist_page.login_callout_html", {
      login_url: this.app.routes.accountLoginUrl,
      register_url: this.app.routes.accountRegisterUrl,
    })}
        </p>
      </div>
    `;
  }

  renderWishlistItems() {
    if (!this.wishlist.items.length) {
      return;
    }

    const wishlistItems = this.wishlist.items.slice().reverse();

    return html`
      <div class="wk-grid">
        ${repeat(
      wishlistItems,
      (wishlistItem) => wishlistItem.id,
      (wishlistItem) => html`
            <wishlist-product-card
              data-wishlist-id=${this.wishlist.id}
              data-wishlist-item-id=${wishlistItem.id}
              .wishlist=${this.wishlist}
              .moveToCart=${this.moveToCart}
              .showVendor=${this.showVendor}
              .showProductTitle=${this.showProductTitle}
              .showPrice=${this.showPrice}
              .ctaButton=${this.ctaButton}
              .productOptions=${this.productOptions}
            ></wishlist-product-card>
          `
    )}
      </div>
    `;
  }

  connectedCallback() {
    if (!this.dataset.wishlistId) {
      this.dataset.wishlistId = this.app.theme.getWishlistId(window.location.pathname);
    }

    if (this.dataset.wishlistId && this.dataset.wishlistId !== "mine") {
      this.loadWithoutSession = true;
    }

    super.connectedCallback();
  }
};

class WishlistProductCard extends WishlistElement {
  static get properties() {
    return {
      wishlist: { type: Object },
      moveToCart: { type: String, attribute: "move-to-cart" },
      showVendor: { type: Boolean, attribute: "show-vendor" },
      showProductTitle: { type: Boolean, attribute: "show-product-title" },
      showPrice: { type: Boolean, attribute: "show-price" },
      ctaButton: { type: Boolean, attribute: "cta-button" },
      productOptions: { type: Boolean, attribute: "product-options" },
    };
  }

  constructor() {
    super();

    this.form = new ProductFormController(this);
  }

  willUpdate(changedProperties) {
    if (changedProperties.has("wishlistItem")) {
      this.form.setProduct({
        product: this.wishlistItem.product,
        selectedVariantId: this.wishlistItem.variantId,
        autoSelect: false,
      });
    }
  }

  getStateConfig() {
    return {
      loading: "lazy",
      wishlistItem: true,
    };
  }

  getEventConfig() {
    return {
      "change .wk-form": async (event) => {
        if (event.target.name === "quantity") {
          return;
        }

        this.form.changeOption({
          input: event.target,
          autoSelect: false,
        });

        if (this.form.selectedVariant && this.wishlist.isMine) {
          await this.app.updateWishlistItem({
            wishlistItemId: this.wishlistItem.id,
            changes: {
              variantId: this.form.selectedVariant.id,
            },
          });
        }
      },
      "submit .wk-form": async (event) => {
        event.preventDefault();

        await this.form.addToCart({
          wishlistId: this.wishlist.id,
          wishlistItemId: this.wishlistItem.id,
        });

        if (this.moveToCart && this.wishlist.isMine) {
          await this.app.removeWishlistItem({
            wishlistItemId: this.wishlistItem.id,
          });
        }

        window.location.href = this.app.routes.cartUrl;
      },
    };
  }

  render() {
    if (!this.wishlistItem.product.id) {
      return html`
        <div class="wk-product-card">${this.renderLoadingState()}</div>
      `;
    }

    if (this.wishlistItem.product.hidden) {
      return html`
        <div class="wk-product-card">${this.renderUnavailableState()}</div>
      `;
    }

    const product = this.wishlistItem.product;
    const variant = this.form.selectedVariant;

    return html`
      <div class="wk-product-card">
        <a href=${this.getProductUrl(product, variant)} class="wk-image-link">
          <img
            class="wk-image"
            src=${this.getImageUrl(product, variant, {
      width: 1000,
      height: 1000,
    })}
          />
        </a>
        <div class="wk-meta">
          ${this.renderVendor({ product, variant })}
          ${this.renderProductTitle({ product, variant })}
          ${this.renderPrice({ product, variant })}
        </div>
        ${this.renderProductForm({ product, variant })}
        ${this.renderRemoveButton()}
      </div>
    `;
  }

  renderVendor({ product }) {
    if (!this.showVendor) {
      return;
    }
    return html`<span class="wk-vendor">${product.vendor}</span>`;
  }

  renderProductTitle({ product, variant }) {
    if (!this.showProductTitle) {
      return;
    }
    return html`
      <div class="wk-product-title">
        <a class="wk-text-link" href=${this.getProductUrl(product, variant)}>
          ${product.title}
        </a>
      </div>
    `;
  }

  renderPrice({ product, variant }) {
    if (!this.showPrice) {
      return;
    }
    return html`
      <div class="wk-price">
        ${this.renderComparePrice({ product, variant })}
        ${this.renderCurrentPrice({ product, variant })}
      </div>
      ${this.renderUnitPrice({ product, variant })}
    `;
  }

  renderCurrentPrice({ product, variant }) {
    if (variant) {
      const sale = variant.price < variant.compare_at_price;

      return html`
        <span class="wk-current-price ${sale ? "wk-sale" : ""}">
          ${this.renderMoney(variant.price)}
        </span>
      `;
    }

    if (product.price_min !== product.price_max) {
      return html`
        <span class="wk-current-price">
          ${this.getTranslation("wishlist_product.from_price_html", {
        price: this.formatMoney(product.price_min),
      })}
        </span>
      `;
    }

    return html`
      <span class="wk-current-price">
        ${this.renderMoney(product.price_min)}
      </span>
    `;
  }

  renderComparePrice({ variant }) {
    if (variant && variant.price < variant.compare_at_price) {
      return html`
        <span class="wk-compare-price">
          ${this.renderMoney(variant.compare_at_price)}
        </span>
      `;
    }
  }

  renderUnitPrice({ variant }) {
    if (!variant) {
      return;
    }

    const unitPrice = variant.unit_price_measurement;

    if (!unitPrice) {
      return;
    }

    const baseUnit =
      unitPrice.reference_value != 1
        ? unitPrice.reference_value
        : unitPrice.reference_unit;

    return html`
      <div class="wk-unit-price">
        <span class="wk-unit-price-money">${this.renderMoney(variant.unit_price)}</span>
        <span class="wk-unit-price-separator"> / </span>
        <span class="wk-unit-price-unit">${baseUnit}</span>
      </div>
    `;
  }

  renderProductForm({ product, variant }) {
    return html`
      <form
        class="wk-form"
        method="post"
        action=${this.ctaButton ? this.app.routes.cartAddUrl : ""}
        data-wishlist-id=${this.wishlist.id}
        data-wishlist-item-id=${this.wishlistItem.id}
      >
        <input
          name="id"
          value=${this.form.selectedVariant
        ? this.form.selectedVariant.id
        : ""}
          type="hidden"
        />
        ${this.renderProductOptions()}
        <div class="wk-quantity">
          <label class="wk-quantity-label">
            ${this.getTranslation("wishlist_product.quantity")}
          </label>
          <input
            class="wk-quantity-input"
            type="number"
            name="quantity"
            value="1"
            min="1"
          />
        </div>
        ${this.renderCta({ product, variant })}
      </form>
    `;
  }

  renderCta({ product, variant }) {
    const getCtaText = () => {
      if (this.ctaButton === "view-product") {
        return this.getTranslation("wishlist_product.view_product");
      }
      if (!variant && this.form.hasSelection) {
        return this.getTranslation("wishlist_product.unavailable");
      } else if (!variant) {
        return this.getTranslation("wishlist_product.select_option", {
          name: this.form.optionsWithValues.find(
            (option) => !option.selectedValue
          ).name,
        });
      }

      if (!variant.available) {
        return this.getTranslation("wishlist_product.sold_out");
      }

      return this.getTranslation("wishlist_product.add_to_cart");
    };

    switch (this.ctaButton) {
      case "add-to-cart":
        return html`
          <button
            type="submit"
            class="wk-cta-button"
            data-wishlist-item-id=${this.wishlistItem.id}
            ?disabled=${!variant || !variant.available}
          >
            <span class="wk-cta-label">${getCtaText()}</span>
            <wk-icon icon="spinner" class="wk-cta-spinner"></wk-icon>
          </button>
        `;
      case "view-product":
        return html`
          <a
            class="wk-cta-button"
            data-wishlist-item-id=${this.wishlistItem.id}
            href=${product.url}
          >
            <span class="wk-cta-label">${getCtaText()}</span>
          </a>
        `;
      default:
      case "none":
        return null;
    }
  }

  renderProductOptions() {
    if (this.form.hasOnlyDefaultVariant) {
      return;
    }

    switch (this.productOptions) {
      case "dropdowns":
        return html`
          <div class="wk-variants">
            ${this.form.optionsWithValues.map(
          (option) =>
            html`
                  <wk-option-select
                    id=${`${this.wishlistItem.id}-${option.name}`}
                    .option=${option}
                    .defaultText=${this.getTranslation(
              "wishlist_product.select_option",
              option
            )}
                  ></wk-option-select>
                `
        )}
          </div>
        `;
      case "swatches":
        return html`
          <div class="wk-variants">
            ${this.form.optionsWithValues.map(
          (option) =>
            html`
                  <wk-option-swatches
                    id=${`${this.wishlistItem.id}-${option.name}`}
                    .option=${option}
                    .colorMap=${this.getColorMap(option)}
                  ></wk-option-swatches>
                `
        )}
          </div>
        `;
      default:
      case "none":
        return null;
    }
  }

  getColorMap(option) {
    return;
  }

  renderLoadingState() {
    return html`
      <div class="wk-image">
          <wk-icon icon="spinner" class="wk-loading-spinner"></wk-icon>
        </div>  
      </div>
    `;
  }

  renderUnavailableState() {
    return html`
      <div class="wk-image-link">
        <img
          class="wk-image"
          src=${this.getImageUrl(null, null, { width: 1000, height: 1000 })}
        />
      </div>
      <div class="wk-meta">
        <span class="wk-vendor">&nbsp;</span>
        <span class="wk-product-title">
          ${this.getTranslation("wishlist_page.product_removed_html")}
        </span>
      </div>
      ${this.renderRemoveButton()}
    `;
  }

  renderRemoveButton() {
    if (!this.wishlist.isMine) {
      return;
    }

    const floatSettings = {
      reference: this,
      position: {
        placement: "top-end",
        inset: true,
      },
    };

    return html`
      <remove-button
        data-wishlist-item-id=${this.wishlistItem.id}
        .showIcon=${true}
        .showText=${false}
        .floating=${floatSettings}
      ></remove-button>
    `;
  }
};

export class RemoveButton extends WishlistElement {
  static get properties() {
    return {
      floating: { type: Object },
      showIcon: { type: Boolean, attribute: "show-icon" },
      showText: { type: Boolean, attribute: "show-text" },
    };
  }

  getEventConfig() {
    return {
      "click .wk-button": this.handleClick,
    };
  }

  handleClick() {
    return this.app.removeWishlistItem({
      wishlistItemId: this.dataset.wishlistItemId,
    });
  }

  render() {
    const text = this.getTranslation("wishlist_page.remove_product");
    const hint = this.getTranslation("wishlist_page.remove_product");

    return html`
      <wk-button
        .text=${text}
        .hint=${hint}
        .showIcon=${this.showIcon}
        .showText=${this.showText}
        .floating=${this.floating}
        .icon=${"remove"}
      ></wk-button>
    `;
  }
}

export class WishlistAddToCart extends WishlistElement {
  static get properties() {
    return {
      moveToCart: { type: Boolean, attribute: "move-to-cart" },
      loading: { type: Boolean, state: true },
    };
  }

  getStateConfig() {
    return {
      wishlist: true,
    };
  }

  getEventConfig() {
    return {
      "click wk-button": this.handleClick,
    };
  }

  async handleClick() {
    this.loading = true;

    const { wishlistItems } = await this.app.addAllToCart({
      wishlistId: this.wishlist.id,
    });

    if (this.moveToCart && this.wishlist.isMine) {
      // TODO: Remove added items from list
    }

    if (wishlistItems.length) {
      window.location.href = this.app.routes.cartUrl;
    }

    this.loading = false;
  }

  render() {
    const text = this.getTranslation("wishlist_page.add_all_to_cart");

    return html`
      <wk-button
        .text=${text}
        .hint=${text}
        .showIcon=${true}
        .showText=${true}
        .icon=${this.loading ? "spinner" : "buy"}
        .disabled=${this.loading}
      ></wk-button>
    `;
  }
}

export class WishlistShare extends WishlistElement {
  static get properties() {
    return {
      layout: { type: String },
      floating: { type: Object },
      linkCopied: { type: Boolean, state: true },
    };
  }

  getStateConfig() {
    return {
      wishlist: true,
    };
  }

  getEventConfig() {
    return {
      "click wk-button": this.handleClick,
    };
  }

  async handleClick() {
    const { clipboard } = await this.app.shareWishlist({
      wishlistId: this.wishlist.publicId,
      title: this.getTranslation("wishlist_share.share_title"),
      text: this.getTranslation("wishlist_share.share_message"),
    });

    if (clipboard) {
      this.linkCopied = true;
      await new Promise((resolve) => setTimeout(resolve, 2000));
      this.linkCopied = false;
    }
  }

  render() {
    const text = this.getTranslation(
      this.linkCopied
        ? "wishlist_share.link_copied"
        : "wishlist_share.button_label"
    );

    return html`
      <wk-button
        .text=${text}
        .hint=${text}
        .floating=${this.floating}
        .showIcon=${true}
        .showText=${true}
        .icon=${"share"}
      ></wk-button>
    `;
  }
}

export class WishlistClear extends WishlistElement {
  getStateConfig() {
    return {
      wishlist: true,
    };
  }

  getEventConfig() {
    return {
      "click wk-button": this.handleClick,
    };
  }

  async handleClick() {
    await this.app.clearWishlist();
  }

  render() {
    const text = this.getTranslation("wishlist_buttons.clear_wishlist");

    return html`
      <wk-button
        .text=${text}
        .hint=${text}
        .showIcon=${true}
        .showText=${true}
        .icon=${"remove"}
      ></wk-button>
    `;
  }
}

customElements.define("wishlist-page", WishlistPage);
customElements.define("wishlist-product-card", WishlistProductCard);
customElements.define("remove-button", RemoveButton);
customElements.define("wishlist-add-to-cart", WishlistAddToCart);
customElements.define("wishlist-share", WishlistShare);
customElements.define("wishlist-clear", WishlistClear);