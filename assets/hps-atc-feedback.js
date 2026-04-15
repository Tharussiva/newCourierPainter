/**
 * HPS Add-to-Cart Feedback
 *
 * Provides a minimal cart-notification custom element so that Dawn's
 * product-form.js skips its redirect-to-cart fallback and instead:
 *   1. Fires the cartUpdate pubsub event → sidebar count/total updates automatically.
 *   2. Calls renderContents() on this element → we show "Added to cart" button
 *      feedback for 2 s, then restore the original label.
 *
 * Must be loaded before product-form.js initialises the <product-form> element.
 */

if (!customElements.get('cart-notification')) {
  customElements.define(
    'cart-notification',
    class HpsCartNotification extends HTMLElement {
      /** Called by product-form.js with document.activeElement before the fetch. */
      setActiveElement(el) {
        this._activeEl = el;
      }

      /**
       * product-form.js appends section IDs from this list to the POST body.
       * We return an empty array — no section HTML re-rendering needed.
       */
      getSectionsToRender() {
        return [];
      }

      /**
       * Called by product-form.js after a successful cart/add response.
       * Show "Added to cart" on the submit button, then restore after 2 s.
       */
      renderContents() {
        const btn =
          (this._activeEl && this._activeEl.closest
            ? this._activeEl.closest('button[type="submit"]') || this._activeEl
            : null) ||
          document.querySelector('button[type="submit"][name="add"]');

        if (!btn) return;

        const span = btn.querySelector('span');
        if (!span) return;

        const original = span.textContent.trim();
        span.textContent = 'Added to cart';

        clearTimeout(this._resetTimer);
        this._resetTimer = setTimeout(function () {
          span.textContent = original;
        }, 2000);
      }
    }
  );
}
