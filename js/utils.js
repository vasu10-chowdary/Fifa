/* =============================================================
   PulseOS — Shared Utilities
   Provides common mathematical, string, and DOM helpers
   ============================================================= */

(function () {
  'use strict';

  var PulseUtils = {
    /**
     * Generates a random float between min and max.
     */
    rand: function (min, max) { 
      return Math.random() * (max - min) + min; 
    },
    
    /**
     * Generates a random integer between min and max (inclusive).
     */
    randInt: function (min, max) { 
      return Math.floor(this.rand(min, max + 1)); 
    },
    
    /**
     * Picks a random element from an array.
     */
    pick: function (arr) { 
      if (!arr || !arr.length) return null;
      return arr[this.randInt(0, arr.length - 1)]; 
    },
    
    /**
     * Clamps a value between a minimum and maximum.
     */
    clamp: function (v, lo, hi) { 
      return Math.max(lo, Math.min(hi, v)); 
    },
    
    /**
     * Calculates a percentage (0-100) rounded to 1 decimal.
     */
    pct: function (v, total) { 
      if (total === 0) return 0;
      return Math.round((v / total) * 1000) / 10; 
    },
    
    /**
     * Formats large numbers with K or M suffixes.
     */
    formatNumber: function (n) {
      if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
      if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
      return String(n);
    },
    
    /**
     * Extracts initials from a full name (first and last).
     */
    getInitials: function (name) {
      if (!name || typeof name !== 'string' || !name.trim()) return '??';
      var words = name.trim().split(/\s+/);
      if (words.length === 1) return words[0][0].toUpperCase();
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    },
    
    /**
     * Converts an ISO date string to a human-readable "time ago" string.
     */
    timeAgo: function (date) {
      var seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
      if (seconds < 60) return seconds + 's ago';
      if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
      if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
      return Math.floor(seconds / 86400) + 'd ago';
    },
    
    /**
     * Safely sets text content of a DOM element.
     */
    setText: function (el, text) {
      if (el) el.textContent = String(text);
    },
    
    /**
     * Creates a debounced function.
     */
    debounce: function (fn, delay) {
      var timer;
      return function () {
        var context = this;
        var args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
          fn.apply(context, args);
        }, delay);
      };
    },
    
    /**
     * Creates a throttled function.
     */
    throttle: function (fn, limit) {
      var inThrottle;
      return function () {
        var context = this;
        var args = arguments;
        if (!inThrottle) {
          fn.apply(context, args);
          inThrottle = true;
          setTimeout(function () {
            inThrottle = false;
          }, limit);
        }
      };
    },
    
    /**
     * Safely parses JSON with a fallback value.
     */
    parseJSON: function (str, fallback) {
      try { 
        return JSON.parse(str); 
      } catch (e) { 
        return fallback !== undefined ? fallback : null; 
      }
    },
    
    /**
     * Generates a unique ID string.
     */
    uid: function (prefix) {
      return (prefix || 'id') + '-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
    },
    
    /**
     * Linear interpolation between two values.
     */
    lerp: function (a, b, t) { 
      return a + (b - a) * t; 
    },
    
    /**
     * Maps a value from one range to another.
     */
    mapRange: function (value, inMin, inMax, outMin, outMax) {
      return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
    }
  };

  window.PulseUtils = PulseUtils;

})();
