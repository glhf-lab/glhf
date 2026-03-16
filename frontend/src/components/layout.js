import { useEffect, useState } from "react"
import Navbar from "./elements/navbar"
import Footer from "./elements/footer"
import NotificationBanner from "./elements/notification-banner"

const Layout = ({ children, global, pageContext }) => {
  const { navbar, footer, notificationBanner, studyName } = global.attributes
  return (
    <div className="flex min-h-screen flex-col justify-between">
      {/* Aligned to the top */}
      <div className="flex-1">
        {notificationBanner?.enabled && (
          <NotificationBanner data={notificationBanner} />
        )}
        <Navbar navbar={navbar} pageContext={pageContext} />
        <main id="main-content">{children}</main>
      </div>
      {/* Aligned to the bottom */}
      <Footer footer={footer} studyName={studyName} />
    </div>
  )
}

export default Layout
