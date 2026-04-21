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
        // Resolve the submit button reliably. Never fall back to this._activeEl
        // itself — on iOS Safari after a tap, document.activeElement is often
        // <body>, which would cause querySelector('span') below to target the
        // first span ANYWHERE in the page (logo, sidebar, etc.), making the
        // feedback text appear far from the actual button.
        let btn = null;
        if (this._activeEl && typeof this._activeEl.closest === 'function') {
          btn = this._activeEl.closest('button[type="submit"][name="add"]');
        }
        if (!btn) {
          btn = document.querySelector('product-form button[type="submit"][name="add"]')
             || document.querySelector('button[type="submit"][name="add"]');
        }
        if (!btn) return;

        // Force-exit the loading state so the feedback text is visible. Dawn's
        // product-form.js removes '.loading' after renderContents() returns, but
        // on slower/mobile paints the brief overlap (spinner + transparent text)
        // makes the "Added to cart" swap flash invisibly. Removing it here — and
        // re-hiding the spinner — guarantees a clean handoff.
        btn.classList.remove('loading');
        const spinner = btn.querySelector('.loading__spinner');
        if (spinner) spinner.classList.add('hidden');

        // Match only the direct-child text span (not any <span> nested inside
        // the spinner SVG or elsewhere).
        const span = btn.querySelector(':scope > span');
        if (!span) return;

        // Preserve the true original label (not whatever's currently rendered —
        // could be "Added to cart" from a rapid double-click).
        if (!this._originalLabel) {
          this._originalLabel = span.textContent.trim();
        }
        span.textContent = 'Added';

        clearTimeout(this._resetTimer);
        const self = this;
        this._resetTimer = setTimeout(function () {
          span.textContent = self._originalLabel;
        }, 2000);
      }
    }
  );
}
