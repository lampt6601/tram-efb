# Codebase Index

## apps/web — Public Storefront (Next.js 16, port 3000)

### Pages (src/app/)
- `page.tsx` — Homepage (HomePage, soldItems, metadata, revalidate=120)
- `accounts/[id]/page.tsx` — Account detail page
- `shop/[name]/page.tsx` — Per-seller shop page
- `seller/apply/` — Seller application form (SellerApplyForm)
- `sell/page.tsx` — Sell request page
- `faq/page.tsx` — FAQ (FAQAccordion)
- `event/page.tsx` — Event/spin wheel page (EventPageClient, SpinWheel, NumberPickerForm, WinnerAnnouncement, EventInfo)
- `request/page.tsx` — Account request page
- `bao-ke/page.tsx` — Bảo kê page
- `policy/` — Policy pages

### Actions (src/app/actions/)
- `sell-request-actions.ts` — getSellRequests, submitSellRequest, updateSellRequestStatus (MAX_FILE_SIZE, MAX_IMAGES)
- `seller-application-actions.ts` — submitSellerApplication, updateApplicationStatus
- `request-actions.ts` — account request actions
- `event-actions.ts` — event actions
- `upload-image.ts` — image upload action

### API Routes (src/app/api/)
- `contact/[accountId]/route.ts` — contact buyer
- `contact/owner/route.ts` — contact owner
- `contact/seller/[name]/route.ts` — contact seller
- `upload-image/route.ts` — image upload
- `suggestions/public/route.ts` — public suggestions

### Components (src/components/storefront/)
- `StatsBar.tsx` — StatsBar (soldCount + sellerCount via getSellerCount)
- `AccountCard.tsx` — AccountCard (formatCompactCurrency, optimizedThumb, isSold)
- `Header.tsx` — Header
- `Footer.tsx` — Footer
- `AccountFilters.tsx` — filter UI
- `SellerContactCard.tsx` — seller contact (uses sellerCount)
- `BuyNowButton.tsx` — buy now CTA
- `StickyBuyBar.tsx` — sticky bottom bar
- `CollateralBadge.tsx` — collateral display
- `ShareButtons.tsx` — social share
- `RelatedAccounts.tsx` — related accounts
- `OwnerSection.tsx` — owner info
- `RecruitAdminSection.tsx` — recruit CTA
- `RecruitHeroCTA.tsx` — hero CTA
- `BuybackPolicy.tsx` — buyback policy
- `ZaloNotify.tsx` — Zalo notify opt-in
- `ThemeToggle.tsx` / `ThemeProvider.tsx` — dark mode

### Lib (src/lib/)
- `cached-users.ts` — getAdminUsers, getSellerCount (unstable_cache, service role)
- `site-settings.ts` — getAllSiteSettings, getSiteSetting, getSiteSettings
- `imagekit.ts` — ImageKit helpers
- `zalo-bot.ts` — Zalo bot notifications
- `facebook-share.ts` — FB share helpers
- `storage.ts` — storage utilities

---

## apps/admin — Admin Dashboard (Next.js, separate Vercel deploy)

### Pages (src/app/dashboard/)
- `page.tsx` — Dashboard home
- `accounts/` — Account CRUD (AccountActionsDropdown, AdminAccountFilters, CopyLinkButton)
- `accounts/new/page.tsx` — Create account (AccountForm)
- `accounts/[id]/edit/page.tsx` — Edit account
- `sell-requests/page.tsx` — Sell requests list
- `requests/page.tsx` — Account requests (RequestFilters, MarkCompleteButton)
- `emails/page.tsx` — Email templates (DeleteButton, EmailFilters, LinkedAccountDetailButton)
- `profile/page.tsx` — Admin profile (ProfileForm, AvatarUpload, ChangePasswordSection)
- `noti/page.tsx` — Notifications (NotiDetailClient)
- `all-accounts/page.tsx` — View all accounts (AccountDetailButton)
- `guide/page.tsx` — Guide page
- `super/` — Super-admin only section:
  - `admins/page.tsx` — Manage admins (CreateAdminModal, DisableAdminToggle, CollateralManageModal, DeleteAdminButton, AdminActionsDropdown, AutoApproveToggle, ResetPasswordModal)
  - `accounts/page.tsx` — All accounts view (SuperAccountFilters, SuperAccountActionsDropdown, SuperAccountEditSheet, SuperAccountDeleteButton, UnapproveButton)
  - `pending/page.tsx` — Pending approvals (ApproveButton, PendingAccountDrawer, PendingActionsDropdown)
  - `revenue/page.tsx` — Revenue analytics (AdminRevenueFilter)
  - `applications/page.tsx` — Seller applications
  - `reviews/` — Review moderation
  - `settings/page.tsx` — Site settings (SiteSettingsForm)
  - `event/spin/page.tsx` — Spin wheel admin (SpinWheelAdmin)

### Actions (src/app/actions/)
- `account-actions.ts` — checkAdminRestricted, toggleAccountPriority
- `super-admin-actions.ts` — approveAccount, buybackAccount, copyAccountToAdmin, createAdmin, deleteAdmin, getSellerCollateralHistory, getSuperAccountForEdit, resetAdminPassword, setAdminAutoApprove, setAdminDisabled, superAdminDeleteAccount, superAdminUpdateAccount, unapproveAccount, updateAdminProfile, updateSellerCollateral, updateSiteSetting, updateTransactionBoxUrl, verifySuperAdmin
- `notify-admin.ts` — notifyAdminAction (actionTypeMap, actionEmoji, ADMIN_URL, BASE_URL)
- `seller-application-actions.ts` — submitSellerApplication, updateApplicationStatus
- `event-actions.ts`, `sell-request-actions.ts`, `request-actions.ts`, `profile-actions.ts`, `upload-image.ts`

### API Routes (src/app/api/)
- `approve/[id]/route.ts` — quick-approve link
- `push/subscribe/route.ts` — push subscription
- `upload-image/route.ts` — image upload
- `account/[id]/route.ts` — account API
- `notifications/route.ts`, `notifications/seed/route.ts` — notifications
- `suggestions/admin|public|super/route.ts` — suggestions

### Components (src/components/)
- `admin/AccountForm.tsx` — AccountForm (AccountFormProps, AccountFormValues)
- `admin/Sidebar.tsx` — Sidebar (navItems, superAdminNavItems, SidebarProps)
- `admin/AdminShell.tsx` — AdminShell layout wrapper
- `admin/MobileBottomNav.tsx` — mobile bottom nav
- `admin/AccountDetailDialog.tsx` / `AccountDetailContent.tsx` / `AccountDetailOpener.tsx` — account detail
- `admin/AccountEditSheet.tsx` — edit sheet
- `admin/RevenueTrendChart.tsx` / `SalesTrendChart.tsx` — charts
- `admin/StatBox.tsx` / `SidebarStats.tsx` / `CTVLeaderboard.tsx` / `HotRequests.tsx` — stat components
- `admin/AdminToggleButton.tsx` — toggle
- `notifications/NotificationBell.tsx` / `NotificationPanel.tsx` / `PushOptIn.tsx` — notification UI
- `common/ThemeToggle.tsx` / `OfflineIndicator.tsx` — common UI

### Lib (src/lib/)
- `cached-users.ts` — getAdminUsers, getSellerCount (same pattern as web)
- `account-queries.ts` — ACCOUNT_SELECT, applySortToQuery
- `notifications.ts` — createNotification, getUnreadCount, CreateNotificationInput, NotificationType
- `push.ts` — sendPushToAllAdmins, sendPushToUser, PushPayload, PushAction, VAPID vars
- `filter-options.ts` — filter option constants
- `site-settings.ts` — getAllSiteSettings, getSiteSetting, getSiteSettings
- `imagekit.ts`, `zalo-bot.ts`, `facebook-share.ts`, `storage.ts`

---

## packages/supabase — Shared Supabase Clients

### Types (src/types/database.ts)
Interfaces: Account, AccountRequest, AccountWithEmail, AdminSettings, DashboardMetrics, Email, PublicAccount, SellerApplication, SellerCollateralHistory, SellRequest, SiteSetting
Constants: AccountStatus, ApplicationStatus, SellRequestStatus

### Clients (src/clients/)
- `browser.ts` — createSupabaseBrowserClient
- `server.ts` — createSupabaseServerClient
- `service.ts` — createSupabaseServiceClient (needs SUPABASE_SERVICE_ROLE_KEY)
- `anon.ts` — createSupabaseAnonClient
