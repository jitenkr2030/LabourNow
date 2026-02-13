// Analytics Services Integration for LabourNow
export class AnalyticsServices {
  private providers: Map<string, any> = new Map()

  constructor() {
    this.initializeProviders()
  }

  private initializeProviders() {
    // Google Analytics
    this.providers.set('google', {
      measurementId: process.env.GA_MEASUREMENT_ID || process.env.GOOGLE_ANALYTICS_ID || '',
      apiKey: process.env.GA_API_KEY || '',
      enabled: !!process.env.GOOGLE_ANALYTICS_ID
    })

    // Mixpanel
    this.providers.set('mixpanel', {
      token: process.env.MIXPANEL_TOKEN || '',
      enabled: !!process.env.MIXPANEL_TOKEN
    })

    // Amplitude
    this.providers.set('amplitude', {
      apiKey: process.env.AMPLITUDE_API_KEY || '',
      enabled: !!process.env.AMPLITUDE_API_KEY
    })

    // Hotjar
    this.providers.set('hotjar', {
      siteId: process.env.HOTJAR_SITE_ID || '',
      enabled: !!process.env.HOTJAR_SITE_ID
    })

    // Segment
    this.providers.set('segment', {
      writeKey: process.env.SEGMENT_WRITE_KEY || '',
      enabled: !!process.env.SEGMENT_WRITE_KEY
    })

    // Custom Analytics
    this.providers.set('custom', {
      endpoint: process.env.CUSTOM_ANALYTICS_ENDPOINT || '',
      apiKey: process.env.CUSTOM_ANALYTICS_API_KEY || '',
      enabled: !!process.env.CUSTOM_ANALYTICS_ENDPOINT
    })
  }

  // Initialize all analytics providers
  initializeAll() {
    this.initializeGoogleAnalytics()
    this.initializeMixpanel()
    this.initializeAmplitude()
    this.initializeHotjar()
    this.initializeSegment()
    this.initializeCustomAnalytics()
  }

  // Google Analytics
  private initializeGoogleAnalytics() {
    const config = this.providers.get('google')
    if (!config.enabled) return

    // Load gtag script
    if (typeof window !== 'undefined' && !window.gtag) {
      const script = document.createElement('script')
      script.src = `https://www.googletagmanager.com/gtag/js?id=${config.measurementId}`
      script.async = true
      document.head.appendChild(script)

      script.onload = () => {
        window.dataLayer = window.dataLayer || []
        window.gtag = function() {
          window.dataLayer.push(arguments)
        }
        window.gtag('js', new Date())
        window.gtag('config', config.measurementId, {
          send_page_view: false,
          anonymize_ip: true,
          allow_google_signals: false
        })
      }
    }
  }

  // Mixpanel
  private initializeMixpanel() {
    const config = this.providers.get('mixpanel')
    if (!config.enabled) return

    if (typeof window !== 'undefined') {
      // Load Mixpanel script
      (function(e: any, a: any) {
        if (!e.__mixpanel) {
          e.__mixpanel = a;
          a.init = function(e, a, d) {
            var b = a;
            return "function" == typeof d ? (b.methods = d, b.methods.forEach(function(a) {
              b[a] = function() {
                b.push([a].concat(Array.prototype.slice.call(arguments, 0))));
                return window.__mixpanel
              }
            }), b.init = function(e, a) {
              return b.track("init", [e, a])
            }) : b.track("init", [e, a]) : b.track("init", [e, a]);
          }, b.methods = ["track", "page", "identify", "alias", "group", "reset", "track_links", "track_forms", "register", "register_once", "unregister", "people.set", "people.set_once", "people.increment", "people.append", "people.union", "people.track_charge", "people.clear_charges"], b.factory = function(e) {
              return function() {
                var a = Array.prototype.slice.call(arguments);
                return a.unshift(e), b.push(a), b
              }
            }, b.people = {
              set: function(a, d) {
                return b.track("people.set", [a, d])
              },
              set_once: function(a, d) {
                return b.track("people.set_once", [a, d])
              },
              increment: function(a, d) {
                return b.track("people.increment", [a, d])
              },
              append: function(a, d) {
                return b.track("people.append", [a, d])
              },
              union: function(a, d) {
                return b.track("people.union", [a, d])
              },
              track_charge: function(a, d) {
                return b.track("people.track_charge", [a, d])
              },
              clear_charges: function() {
                return b.track("people.clear_charges")
              }
            }, b._i = [], b.init = function(e, a) {
              var d = b;
              return d._i.push([e, a]), d._i.length === 1 && (d._i.forEach(function(a) {
                a[0].call(d, d)
              }), b._i = [])
            }, b
          }(window, document, 'mixpanel');
        }
      })(window, window.document);

      // Initialize Mixpanel
      window.mixpanel.init(config.token, {
        track_pageview: true,
        persistence: 'localStorage'
      })
    }
  }

  // Amplitude
  private initializeAmplitude() {
    const config = this.providers.get('amplitude')
    if (!config.enabled) return

    if (typeof window !== 'undefined') {
      // Load Amplitude script
      (function(e, t, n, s, r, o, a, i) {
        e.amplitudeObject = r;
        e[r] = e[r] || function() {
          (e[r].q = e[r].q || []).push(arguments)
        };
        e[r].l = 1 * new Date();
        a = t.createElement(n);
        a.async = 1;
        a.src = "https://cdn.amplitude.com/libs/amplitude-5.2.2-min.gz.js";
        i = t.getElementsByTagName(n)[0];
        i.parentNode.insertBefore(a, i);
        o = function(e) {
          return function() {
            e.amplitudeObject.q.push(arguments)
          }
        };
        var s = function() {
          s.o(arguments);
          e[r].track.apply(e[r], arguments)
        };
        var c = {
          track: s,
          identify: o,
          setUserId: o,
          setUserProperties: o
        };
        e.amplitude = e.amplitude || {};
        for (var p in c) {
          if (Object.prototype.hasOwnProperty.call(c, p)) {
            e.amplitude[p] = c[p]
          }
        }
      })(window, document, 'script', 'amplitude');

      // Initialize Amplitude
      window.amplitude.getInstance().init(config.apiKey, {
        apiEndpoint: 'https://api2.amplitude.com',
        saveEvents: true,
        includeUtm: true,
        includeReferrer: true,
        includeGclid: true,
        trackSessionEvents: true
      });
    }
  }

  // Hotjar
  private initializeHotjar() {
    const config = this.providers.get('hotjar')
    if (!config.enabled) return

    if (typeof window !== 'undefined') {
      // Load Hotjar script
      (function(h, o, t, j, a, r) {
        h.hj = h.hj || function() {
          (h.hj.q = h.hj.q || []).push(arguments)
        };
        h._hjSettings = {
          hjid: config.siteId,
          hjsv: 6
        };
        a = o.getElementsByTagName('head')[0];
        r = o.createElement('script');
        r.async = 1;
        r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
        a.appendChild(r);
      })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=');
    }
  }

  // Segment
  private initializeSegment() {
    const config = this.providers.get('segment')
    if (!config.enabled) return

    if (typeof window !== 'undefined') {
      // Load Segment script
      !function() {
        var analytics = window.analytics = window.analytics || [];
        if (!analytics.initialize) {
          if (analytics.invoked) {
            window.console && console.error && console.error("Segment snippet included twice.");
          } else {
            analytics.invoked = !0;
            analytics.methods = ["trackSubmit", "trackClick", "trackLink", "trackForm", "pageview", "identify", "reset", "group", "track", "ready", "alias", "debug", "page", "once", "off", "on", "addSourceMiddleware", "addIntegrationMiddleware", "setAnonymousId", "addDestinationMiddleware"];
            analytics.factory = function(e) {
              return function() {
                var t = Array.prototype.slice.call(arguments);
                t.unshift(e);
                analytics.push(t);
                return analytics
              }
            };
            analytics.load = function(key, e) {
              var t = document.createElement("script");
              t.type = "text/javascript";
              t.async = !0;
              t.src = "https://cdn.segment.com/analytics.js/v1/" + key + "/analytics.min.js";
              var n = document.getElementsByTagName("script")[0];
              n.parentNode.insertBefore(t, n);
              analytics._loadOptions = e;
            };
            analytics._writeKey = config.writeKey;
            analytics._loadOptions = {};
            analytics.SNIPPET_VERSION = "4.13.2";
            analytics.load(config.writeKey);
            analytics.page();
          }
        }
      }();
    }
  }

  // Custom Analytics
  private initializeCustomAnalytics() {
    const config = this.providers.get('custom')
    if (!config.enabled) return

    // Custom analytics implementation
    if (typeof window !== 'undefined') {
      window.customAnalytics = {
        track: (event: string, properties: any) => {
          this.sendCustomEvent(event, properties)
        },
        identify: (userId: string, traits: any) => {
          this.sendCustomIdentify(userId, traits)
        },
        page: (page: string, properties: any) => {
          this.sendCustomPage(page, properties)
        }
      }
    }
  }

  // Track event across all enabled providers
  trackEvent(eventName: string, properties: any = {}, options: any = {}) {
    const { providers = ['google', 'mixpanel', 'amplitude', 'segment', 'custom'] } = options

    // Add common properties
    const enrichedProperties = {
      ...properties,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'server',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      sessionId: this.getSessionId()
    }

    // Track with Google Analytics
    if (providers.includes('google') && this.providers.get('google').enabled) {
      this.trackGoogleEvent(eventName, enrichedProperties)
    }

    // Track with Mixpanel
    if (providers.includes('mixpanel') && this.providers.get('mixpanel').enabled) {
      this.trackMixpanelEvent(eventName, enrichedProperties)
    }

    // Track with Amplitude
    if (providers.includes('amplitude') && this.providers.get('amplitude').enabled) {
      this.trackAmplitudeEvent(eventName, enrichedProperties)
    }

    // Track with Segment
    if (providers.includes('segment') && this.providers.get('segment').enabled) {
      this.trackSegmentEvent(eventName, enrichedProperties)
    }

    // Track with Custom Analytics
    if (providers.includes('custom') && this.providers.get('custom').enabled) {
      this.trackCustomEvent(eventName, enrichedProperties)
    }
  }

  // Track page view
  trackPage(page: string, properties: any = {}) {
    const enrichedProperties = {
      ...properties,
      page,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'server',
      referrer: typeof document !== 'undefined' ? document.referrer : 'server'
    }

    // Google Analytics
    if (this.providers.get('google').enabled && typeof gtag !== 'undefined') {
      gtag('config', this.providers.get('google').measurementId, {
        page_title: page,
        page_location: enrichedProperties.url
      })
      gtag('event', 'page_view', {
        page_title: page,
        page_location: enrichedProperties.url
      })
    }

    // Mixpanel
    if (this.providers.get('mixpanel').enabled && typeof window !== 'undefined' && window.mixpanel) {
      window.mixpanel.track('Page View', {
        page,
        ...enrichedProperties
      })
    }

    // Amplitude
    if (this.providers.get('amplitude').enabled && typeof window !== 'undefined' && window.amplitude) {
      window.amplitude.getInstance().logEvent('Page View', {
        page,
        ...enrichedProperties
      })
    }

    // Segment
    if (this.providers.get('segment').enabled && typeof window !== 'undefined' && window.analytics) {
      window.analytics.page(page, enrichedProperties)
    }

    // Custom Analytics
    if (this.providers.get('custom').enabled && typeof window !== 'undefined' && window.customAnalytics) {
      window.customAnalytics.page(page, enrichedProperties)
    }
  }

  // Identify user
  identify(userId: string, traits: any = {}) {
    const enrichedTraits = {
      ...traits,
      timestamp: new Date().toISOString()
    }

    // Google Analytics
    if (this.providers.get('google').enabled && typeof gtag !== 'undefined') {
      gtag('config', this.providers.get('google').measurementId, {
        user_id: userId
      })
      gtag('event', 'login', {
        method: 'identified',
        user_id: userId
      })
    }

    // Mixpanel
    if (this.providers.get('mixpanel').enabled && typeof window !== 'undefined' && window.mixpanel) {
      window.mixpanel.identify(userId, enrichedTraits)
      window.mixpanel.people.set(enrichedTraits)
    }

    // Amplitude
    if (this.providers.get('amplitude').enabled && typeof window !== 'undefined' && window.amplitude) {
      window.amplitude.getInstance().setUserId(userId)
      window.amplitude.getInstance().setUserProperties(enrichedTraits)
    }

    // Segment
    if (this.providers.get('segment').enabled && typeof window !== 'undefined' && window.analytics) {
      window.analytics.identify(userId, enrichedTraits)
    }

    // Custom Analytics
    if (this.providers.get('custom').enabled && typeof window !== 'undefined' && window.customAnalytics) {
      window.customAnalytics.identify(userId, enrichedTraits)
    }
  }

  // Track conversion
  trackConversion(conversionId: string, value: number, currency: string = 'INR', properties: any = {}) {
    const enrichedProperties = {
      ...properties,
      value,
      currency,
      conversion_id: conversionId,
      timestamp: new Date().toISOString()
    }

    // Google Analytics
    if (this.providers.get('google').enabled && typeof gtag !== 'undefined') {
      gtag('event', 'conversion', {
        send_to: `${this.providers.get('google').measurementId}/${conversionId}`,
        value,
        currency,
        ...enrichedProperties
      })
    }

    // Mixpanel
    if (this.providers.get('mixpanel').enabled && typeof window !== 'undefined' && window.mixpanel) {
      window.mixpanel.track('Conversion', enrichedProperties)
      window.mixpanel.people.track_charge(value, {
        ...enrichedProperties
      })
    }

    // Amplitude
    if (this.providers.get('amplitude').enabled && typeof window !== 'undefined' && window.amplitude) {
      window.amplitude.getInstance().logRevenue({
        productId: conversionId,
        price: value,
        quantity: 1,
        revenueType: 'purchase'
      })
      window.amplitude.getInstance().logEvent('Conversion', enrichedProperties)
    }

    // Track with other providers
    this.trackEvent('conversion', enrichedProperties, { providers: ['segment', 'custom'] })
  }

  // Provider-specific tracking methods
  private trackGoogleEvent(eventName: string, properties: any) {
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, {
        event_category: properties.category || 'engagement',
        event_label: properties.label,
        value: properties.value,
        custom_parameter_1: properties.integration_id,
        custom_parameter_2: properties.user_id,
        ...properties
      })
    }
  }

  private trackMixpanelEvent(eventName: string, properties: any) {
    if (typeof window !== 'undefined' && window.mixpanel) {
      window.mixpanel.track(eventName, properties)
    }
  }

  private trackAmplitudeEvent(eventName: string, properties: any) {
    if (typeof window !== 'undefined' && window.amplitude) {
      window.amplitude.getInstance().logEvent(eventName, properties)
    }
  }

  private trackSegmentEvent(eventName: string, properties: any) {
    if (typeof window !== 'undefined' && window.analytics) {
      window.analytics.track(eventName, properties)
    }
  }

  private trackCustomEvent(eventName: string, properties: any) {
    if (typeof window !== 'undefined' && window.customAnalytics) {
      window.customAnalytics.track(eventName, properties)
    }
  }

  private sendCustomEvent(event: string, properties: any) {
    // Send to custom analytics endpoint
    const config = this.providers.get('custom')
    if (config.endpoint) {
      fetch(config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          event,
          properties,
          timestamp: new Date().toISOString()
        })
      }).catch(error => {
        console.error('Custom analytics error:', error)
      })
    }
  }

  private sendCustomIdentify(userId: string, traits: any) {
    const config = this.providers.get('custom')
    if (config.endpoint) {
      fetch(`${config.endpoint}/identify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          userId,
          traits,
          timestamp: new Date().toISOString()
        })
      }).catch(error => {
        console.error('Custom analytics identify error:', error)
      })
    }
  }

  private sendCustomPage(page: string, properties: any) {
    const config = this.providers.get('custom')
    if (config.endpoint) {
      fetch(`${config.endpoint}/page`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          page,
          properties,
          timestamp: new Date().toISOString()
        })
      }).catch(error => {
        console.error('Custom analytics page error:', error)
      })
    }
  }

  // Get session ID
  private getSessionId(): string {
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('analytics_session_id')
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        sessionStorage.setItem('analytics_session_id', sessionId)
      }
      return sessionId
    }
    return 'server_session'
  }

  // Get analytics configuration
  getConfiguration() {
    return {
      providers: Array.from(this.providers.keys()).map(provider => ({
        id: provider,
        name: provider.toUpperCase(),
        enabled: this.providers.get(provider).enabled,
        configured: this.isProviderConfigured(provider)
      }))
    }
  }

  // Check if provider is properly configured
  private isProviderConfigured(provider: string): boolean {
    const config = this.providers.get(provider)
    switch (provider) {
      case 'google':
        return !!config.measurementId
      case 'mixpanel':
        return !!config.token
      case 'amplitude':
        return !!config.apiKey
      case 'hotjar':
        return !!config.siteId
      case 'segment':
        return !!config.writeKey
      case 'custom':
        return !!config.endpoint && !!config.apiKey
      default:
        return false
    }
  }

  // Test analytics integration
  async testAnalytics(provider: string): Promise<any> {
    const testEvent = 'analytics_test'
    const testProperties = {
      test: true,
      timestamp: new Date().toISOString()
    }

    try {
      switch (provider) {
        case 'google':
          if (typeof gtag !== 'undefined') {
            gtag('event', testEvent, testProperties)
            return { success: true, provider, event: testEvent }
          }
          break

        case 'mixpanel':
          if (typeof window !== 'undefined' && window.mixpanel) {
            window.mixpanel.track(testEvent, testProperties)
            return { success: true, provider, event: testEvent }
          }
          break

        case 'amplitude':
          if (typeof window !== 'undefined' && window.amplitude) {
            window.amplitude.getInstance().logEvent(testEvent, testProperties)
            return { success: true, provider, event: testEvent }
          }
          break

        case 'segment':
          if (typeof window !== 'undefined' && window.analytics) {
            window.analytics.track(testEvent, testProperties)
            return { success: true, provider, event: testEvent }
          }
          break

        case 'custom':
          await this.sendCustomEvent(testEvent, testProperties)
          return { success: true, provider, event: testEvent }
      }

      return { success: false, provider, error: 'Provider not available' }
    } catch (error) {
      return { 
        success: false, 
        provider, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  // Get analytics data
  async getAnalyticsData(provider: string, timeRange: string = '7d'): Promise<any> {
    // In a real implementation, you would fetch data from the analytics provider's API
    return {
      provider,
      timeRange,
      events: [],
      users: [],
      pageViews: [],
      conversions: [],
      revenue: 0
    }
  }
}

// Export singleton instance
export const analyticsServices = new AnalyticsServices()

// Export individual methods for easier usage
export const {
  initializeAll,
  trackEvent,
  trackPage,
  identify,
  trackConversion,
  getConfiguration,
  testAnalytics,
  getAnalyticsData
} = analyticsServices

export default analyticsServices