# Sponsorship Invoice System Proposal

## Overview

This document outlines a proposed sponsorship management feature that allows super admins to create sponsorship packages and send invoices directly to organizations for payment. This system is designed to be **completely separate from the existing shop/registration workflow** while leveraging the existing order and invoice infrastructure.

---

## Problem Statement

Currently, there's no streamlined way to:
- Create sponsorship packages for specific organizations
- Send invoices directly to potential sponsors
- Track sponsorship payments alongside other event revenue

## Proposed Solution

A dedicated **Sponsorship Invoice System** that:
- Keeps sponsorship data in a separate table
- Uses the existing order/invoice tables (with a sponsorship flag)
- Provides a simple invoice-based payment flow
- Does NOT modify the shop or cart functionality

---

## How It Works

### For Super Admins

1. **Create Sponsorship Packages**
   - Navigate to `/event-registration/sponsorships`
   - Create packages like "Gold Sponsor", "Silver Sponsor", etc.
   - Define name, description, price, and optional benefits
   - Select which organizations can view/receive each package

2. **Send Invoice to Organization**
   - Select an organization from the registered companies
   - Choose a sponsorship package
   - System generates an invoice with a secure token link
   - Email automatically sent to organization admin(s)

3. **Track Payments**
   - View all sponsorship invoices and their status (sent, paid, overdue)
   - See sponsorship revenue on the main dashboard
   - Sponsorship invoices also appear in the main invoices list

### For Organization Admins (Sponsors)

1. **Receive Email**
   - Email contains invoice details and a secure payment link

2. **View & Pay Invoice**
   - Click link to view invoice details (package, price, due date)
   - Click "Pay Now" to complete payment via Stripe
   - No need to navigate through the shop

3. **View in Dashboard**
   - Sponsorship invoices appear in their orders/invoices section

---

## User Interface Locations

| User | Location | Functionality |
|------|----------|---------------|
| Super Admin | `/event-registration/sponsorships` | Create/edit packages, send invoices, view status |
| Super Admin | `/event-registration/invoices` | See sponsorship invoices mixed with all invoices |
| Super Admin | Main Dashboard | Sponsorship revenue graph/widget |
| Org Admin | `/organizations/[slug]/orders` | View their sponsorship invoices |
| Org Admin | `/invoices/[token]` | Secure payment page (token-based access) |

---

## Data Architecture

### New Table: Sponsorship Packages

Stores the sponsorship package templates:
- Package name and description
- Price
- Benefits (optional - e.g., "Logo on website", "Booth space")
- Which organizations can see/purchase it
- Soft delete support

### Extended Existing Tables

**Orders Table**
- New flag: `isSponsorshipOrder` to identify sponsorship purchases

**Order Invoices Table**
- Link to sponsorship package
- Secure access token for payment link

---

## Flow Diagram

```
SUPER ADMIN WORKFLOW
====================

┌──────────────────────────────────────────────────────────────┐
│  Step 1: Create Sponsorship Package                          │
│  ─────────────────────────────────────────────────────────── │
│  • Name: "Gold Sponsor"                                      │
│  • Price: $10,000                                            │
│  • Benefits: Logo placement, 10x10 booth, VIP passes         │
│  • Visible to: [Acme Corp, Tech Inc, ...]                    │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 2: Create Invoice for Organization                     │
│  ─────────────────────────────────────────────────────────── │
│  • Select: Acme Corp                                         │
│  • Package: Gold Sponsor                                     │
│  • Due Date: 30 days from now                                │
│  • [Send Invoice]                                            │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 3: System Actions                                      │
│  ─────────────────────────────────────────────────────────── │
│  • Creates Order (flagged as sponsorship)                    │
│  • Creates Invoice with secure token                         │
│  • Sends email to Acme Corp admin(s)                         │
└──────────────────────────────────────────────────────────────┘


ORGANIZATION ADMIN WORKFLOW
===========================

┌──────────────────────────────────────────────────────────────┐
│  Step 1: Receive Email                                       │
│  ─────────────────────────────────────────────────────────── │
│  "You've received a sponsorship invoice from SportsFest"     │
│  [View Invoice & Pay]                                        │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 2: View Invoice Page                                   │
│  ─────────────────────────────────────────────────────────── │
│  Invoice #SPO-2025-001                                       │
│  ─────────────────────────────────────────────────────────── │
│  Gold Sponsor Package                    $10,000.00          │
│  ─────────────────────────────────────────────────────────── │
│  Benefits included:                                          │
│  • Logo on event website                                     │
│  • 10x10 booth space                                         │
│  • 4 VIP passes                                              │
│  ─────────────────────────────────────────────────────────── │
│  Due: January 15, 2025                                       │
│                                                              │
│  [Pay Now - $10,000.00]                                      │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 3: Stripe Checkout                                     │
│  ─────────────────────────────────────────────────────────── │
│  • Standard Stripe payment flow                              │
│  • Card payment processed                                    │
│  • Webhook updates invoice status to "Paid"                  │
└──────────────────────────────────────────────────────────────┘
```

---

## What This Does NOT Affect

- **Shop functionality** - The `/registration/shop` remains unchanged
- **Cart system** - No modifications to cart flow
- **Product tables** - No new product types or categories needed
- **Existing checkout** - Sponsors don't use the shop checkout

---

## Questions for Decision

### 1. Package Benefits Display
Do you want to define and display benefits for each package?
- Example: "Logo on website", "10x10 booth space", "VIP passes"
- Or just show name + price?

### 2. Invoice Due Dates
Should invoices have:
- Due dates?
- Automatic reminder emails for unpaid invoices?

### 3. Payment Options
- Always pay-in-full?
- Or allow deposit/partial payment option?

### 4. Multiple Packages
Can one organization purchase multiple sponsorship packages?
- Example: Could Acme Corp buy both "Gold Sponsor" AND "Booth Add-on"?

### 5. Package Creation Workflow
When creating an invoice, should the admin:
- **Option A**: Select from pre-defined packages (recommended)
- **Option B**: Create custom one-off deals per organization
- **Option C**: Both options available

---

## Development Estimate

| Component | Complexity |
|-----------|------------|
| Database tables & migrations | Low |
| Sponsorship management page (CRUD) | Medium |
| Invoice creation & email flow | Medium |
| Token-based payment page | Medium |
| Stripe integration (reuses existing) | Low |
| Dashboard widget | Low |
| Organization invoice view | Low |

**Overall Complexity: Medium**

---

## Next Steps

1. Review this proposal
2. Provide answers to the questions above
3. Confirm if this approach meets your needs
4. Development can begin once approved

---

*Document created: December 4, 2025*