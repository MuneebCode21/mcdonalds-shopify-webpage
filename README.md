# McDonald's Pakistan — Modern Shopify Demo Theme

A custom, unofficial Shopify demo theme inspired by the current McDonald's Pakistan information architecture and customer journeys: Menu, Deals, McDelivery, App/Rewards, Restaurants, Family, McCafé and Careers/Community.

## Important
This is a design/demo theme, not an official McDonald's release. Replace demo copy, imagery, links and product data before any commercial deployment.

## Run locally
```powershell
shopify theme dev --store=noirea-demo
```

## What to edit
- Homepage sections: `sections/*.liquid`
- Global design: `assets/mcdonalds.css`
- Interactions/cart/search: `assets/mcdonalds.js`
- Header: `sections/header.liquid`
- Products and prices: Shopify Admin, not hard-coded theme markup
- Homepage section order: `templates/index.json`

## Shopify setup
For real product cards and cart actions, create/import Shopify products and use collection templates. The homepage includes polished visual fallbacks so the storefront does not look empty before products are configured.

## Current Pakistan-inspired features
Menu categories and ordering/app themes are based on the McDonald's Pakistan website and McDelivery ecosystem observed in September 2026. See the accompanying chat sources for current reference links.
