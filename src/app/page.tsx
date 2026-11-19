import Image from "next/image";
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/icon";
import { AccessButton } from "@/components/home/access-button";
import { SiteHeader } from "@/components/home/site-header";
import styles from "@/components/home/home.module.css";
import palace from "../../public/images/palace-wedding.jpg";
import reception from "../../public/images/wedding-reception.jpg";

const features: { name: string; detail: string; icon: IconName; href: string }[] = [
  { name: "Your wedding", detail: "One shared space", icon: "heart", href: "#how-it-works" },
  { name: "Events", detail: "Every celebration", icon: "calendar", href: "#events" },
  { name: "Guests", detail: "Everyone you love", icon: "people", href: "#guests" },
  { name: "Tasks", detail: "A helping hand", icon: "tasks", href: "#family" },
  { name: "Expenses", detail: "Every detail counted", icon: "rupee", href: "#expenses" },
  { name: "Vendors", detail: "Your trusted team", icon: "vendor", href: "#vendors" },
  { name: "Photos", detail: "Memories to keep", icon: "photos", href: "#memories" },
];

function SectionCopy({ eyebrow, title, children, points }: { eyebrow: string; title: string; children: ReactNode; points: string[] }) {
  return (
    <div className={styles.featureCopy}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h2>{title}</h2>
      <p className={styles.description}>{children}</p>
      <ul className={styles.checkList}>{points.map(point => <li key={point}><span><Icon name="check" /></span>{point}</li>)}</ul>
    </div>
  );
}

function SampleLabel() { return <span className={styles.sampleLabel}>Illustrative preview</span>; }

export default function HomePage() {
  return (
    <>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className={styles.main}>
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroIntro}>
            <p className={styles.heroEyebrow}><span /> Made for Indian weddings. Made for your family.</p>
            <h1 id="hero-title">Your wedding.<br className={styles.mobileBreak} /> Beautifully organized.</h1>
            <p className={styles.heroDescription}>Everything your family needs to plan, coordinate, and celebrate your wedding.<br className={styles.desktopBreak} /> Together, in one beautiful place.</p>
            <div className={styles.heroActions}>
              <AccessButton className={styles.primaryButton}>Create your wedding <Icon name="arrow" /></AccessButton>
              <a href="#how-it-works" className={styles.secondaryButton}>See how it works <Icon name="chevron" /></a>
            </div>
            <p className={styles.launchNote}>Create your account today. Wedding planning tools are coming next.</p>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.heroImageFrame}>
              <Image src={palace} alt="A couple standing together beneath the sandstone arches of a Rajasthan palace" fill sizes="(max-width: 760px) 94vw, (max-width: 1280px) 86vw, 1100px" preload placeholder="blur" className={styles.heroImage} />
              <div className={styles.heroShade} />
              <div className={styles.heroCaption}><span>A celebration of togetherness</span><p>For the moments that become forever.</p></div>
            </div>
            <div className={styles.countdownCard}><span className={styles.cardIcon}><Icon name="calendar" /></span><div><span className={styles.microLabel}>The wedding countdown</span><strong>42 days to forever</strong><small>An example of your wedding at a glance</small></div></div>
            <div className={styles.celebrationCard}><span className={styles.avatarStack}><span>A</span><span>P</span><span><Icon name="heart" /></span></span><div><span className={styles.microLabel}>Your people. Your celebrations.</span><strong>Beautifully, together.</strong></div></div>
          </div>
        </section>

        <div className={styles.featureRibbon}><p>One wedding. One place for everything.</p><div>{["Events & tasks", "Guests & RSVPs", "Digital invitations", "Expenses", "Vendors", "Wedding website", "Shared memories"].map(label => <span key={label}>{label}</span>)}</div></div>

        <section id="features" className={`${styles.container} ${styles.introduction}`} aria-labelledby="features-title">
          <p className={styles.eyebrow}>Less scattered. More together.</p>
          <h2 id="features-title">Wedding planning shouldn’t live<br className={styles.desktopBreak} /> across ten different places.</h2>
          <p className={styles.sectionDescription}>Bring your celebrations, family to-dos, guest lists, and shared memories into one calm, connected space.</p>
          <div className={styles.featureRail}>{features.map(feature => <a key={feature.name} href={feature.href}><span className={styles.featureIcon}><Icon name={feature.icon} /></span><strong>{feature.name}</strong><small>{feature.detail}</small></a>)}</div>
        </section>

        <div className={`${styles.container} ${styles.featureSections}`}>
          <section id="events" className={styles.featureRow} aria-label="Wedding events">
            <SectionCopy eyebrow="Many celebrations. One lovely story." title="Every celebration, beautifully organized." points={["Dates, venues, and dress codes in one place", "From Mehendi to Reception, and every custom event", "Keep your family on the same page"]}>From the first dance at your Sangeet to the quiet magic of your Pheras, give every celebration its own place in your wedding story.</SectionCopy>
            <div className={styles.previewCard}>
              <div className={styles.cardHeading}><div><p className={styles.eyebrow}>The celebrations</p><h3>Akshay & Princi’s itinerary</h3></div><span className={styles.pill}>3 events</span></div>
              {[
                { day: "12", title: "Mehendi by the lake", detail: "Lily Pond Pavilion · 4:00 PM", dress: "Lime & ochre" },
                { day: "13", title: "Sangeet & cocktails", detail: "Mughal Gardens · 7:30 PM", dress: "Jewel tones" },
                { day: "14", title: "The wedding ceremony", detail: "Palace Courtyard · 11:20 AM", dress: "Ivory & gold" },
              ].map((event, i) => <div key={event.day} className={`${styles.eventRow} ${i === 2 ? styles.eventSelected : ""}`}><div className={styles.dateTile}><span>Feb</span><strong>{event.day}</strong></div><div className={styles.eventDetails}><h4>{event.title}</h4><p>{event.detail}</p><span>{event.dress}</span></div><Icon name="flower" /></div>)}
              <SampleLabel />
            </div>
          </section>

          <section id="guests" className={`${styles.featureRow} ${styles.reverseRow}`} aria-label="Guests and invitations">
            <SectionCopy eyebrow="Every invitation, a personal welcome" title="Your favourite people. All accounted for." points={["Personal invitation links with selected events", "RSVPs and attending counts, without guest accounts", "Email invitations and manual WhatsApp sharing"]}>A thoughtful invitation, a simple RSVP, and a clear guest list. Spend less time chasing answers and more time looking forward to seeing everyone.</SectionCopy>
            <div className={styles.previewCard}>
              <div className={styles.cardHeading}><div><p className={styles.eyebrow}>The guest list</p><h3>A place for everyone</h3></div><Icon name="people" /></div>
              <div className={styles.guestTableWrap}><table className={styles.guestTable}><caption className={styles.srOnly}>Example guest invitations and RSVP responses</caption><thead><tr><th>Invitation</th><th>Attending</th><th>RSVP</th></tr></thead><tbody>{[["Rajesh Sharma", "3 of 4", "Attending"], ["Meera Kapoor", "2 of 2", "Attending"], ["Aarav Patel", "—", "Pending"]].map(([name, count, status]) => <tr key={name}><th scope="row">{name}</th><td>{count}</td><td><span className={status === "Attending" ? styles.statusAttending : styles.statusPending}>{status}</span></td></tr>)}</tbody></table></div>
              <div className={styles.cardNote}><Icon name="mail" /><span>A personal link. A warm welcome. No guest login.</span></div><SampleLabel />
            </div>
          </section>

          <section id="family" className={styles.familySection} aria-labelledby="family-title">
            <div className={styles.familyHeading}><span className={styles.featureIcon}><Icon name="tasks" /></span><div><p className={styles.eyebrow}>A little help from your favourite people</p><h2 id="family-title">A shared plan. A lighter load.</h2><p>Invite family members to help, assign tasks, and keep track of what’s done and what’s next.</p></div></div>
            <div><div className={styles.taskPreview}><span className={styles.taskCheck}><Icon name="check" /></span><div><strong>Confirm the Sangeet playlist</strong><span>Assigned to Priya · Completed</span></div><span className={styles.taskAvatar}>P</span></div><SampleLabel /></div>
          </section>

          <section id="expenses" className={styles.featureRow} aria-label="Expense tracking">
            <SectionCopy eyebrow="Clarity in every detail" title="Keep wedding spending clear and simple." points={["Record money spent or committed", "See totals and spending by category", "Link expenses to an event or vendor"]}>From the venue to the flowers, keep your wedding expenses in one shared record. Everyone helping can see the same clear picture.</SectionCopy>
            <div className={styles.previewCard}>
              <div className={styles.cardHeading}><div><p className={styles.eyebrow}>Total recorded expenses</p><h3 className={styles.expenseTotal}>₹12,00,000</h3></div><span className={styles.cardIcon}><Icon name="rupee" /></span></div>
              <div className={styles.expenseBar} role="img" aria-label="Expense breakdown: venue 50 percent, catering 35 percent, photography 15 percent"><span /><span /><span /></div>
              <ul className={styles.expenseLegend}><li>Venue</li><li>Catering</li><li>Photography</li></ul>
              {[["vendor", "Palace courtyard venue", "Venue", "₹6,00,000"], ["flower", "Wedding dinner", "Catering", "₹4,20,000"], ["photos", "Wedding photography", "Photography", "₹1,80,000"]].map(([icon, title, category, amount]) => <div className={styles.expenseRow} key={title}><span><Icon name={icon as IconName} /></span><div><strong>{title}</strong><small>{category}</small></div><b>{amount}</b></div>)}
              <SampleLabel />
            </div>
          </section>

          <section id="vendors" className={`${styles.featureRow} ${styles.reverseRow}`} aria-label="Wedding vendors">
            <SectionCopy eyebrow="The people behind the beautiful details" title="Find your people. Bring your vision to life." points={["Discover nearby wedding vendors", "Save contacts, agreed costs, and notes", "Connect your vendors to the right events"]}>Your photographer, your florist, your favourite venue. Keep the people you choose and the details you need together in one easy-to-find directory.</SectionCopy>
            <div><div className={styles.vendorGrid}>{[
              ["vendor", "Venue", "The Palace Courtyard", "Jaipur, Rajasthan", "Wedding & Reception"],
              ["photos", "Photography", "Stories in Light", "Jaipur, Rajasthan", "All celebrations"],
              ["flower", "Decoration", "Marigold Studio", "Jaipur, Rajasthan", "Mehendi & Wedding"],
              ["play", "Entertainment", "The Sangeet Collective", "Jaipur, Rajasthan", "Sangeet"],
            ].map(([icon, type, name, location, events]) => <article key={name} className={styles.vendorCard}><div className={styles.vendorType}><Icon name={icon as IconName} /><span>{type}</span></div><h3>{name}</h3><p>{location}</p><div className={styles.vendorEvents}>{events}</div></article>)}</div><SampleLabel /></div>
          </section>
        </div>

        <section id="wedding-website" className={styles.websiteSection} aria-labelledby="website-title"><div className={styles.container}>
          <div className={styles.centerHeading}><p className={styles.eyebrow}>A little corner of the internet, all yours</p><h2 id="website-title">Your wedding deserves<br />its own beautiful home.</h2><p className={styles.sectionDescription}>Share your story with a themed wedding website.<br className={styles.desktopBreak} /> Give each guest a separate, personal invitation to their celebrations.</p></div>
          <div className={styles.websitePreviews}>
            <div className={styles.websiteWindow}><div className={styles.browserBar}><span className={styles.browserDots}><i /><i /><i /></span><span>makemymarriage.com/w/akshay-princi</span><Icon name="globe" /></div><div className={styles.invitationArt}><Icon name="flower" /><p className={styles.eyebrow}>Together with their families</p><h3>Akshay <span>&</span> Princi</h3><p>Joyfully invite you to celebrate their wedding</p><div className={styles.invitationDivider} /><span className={styles.microLabel}>14 February 2027 · Jaipur</span></div><div className={styles.websiteFoot}><span><Icon name="globe" /> Your wedding website</span><span>Predefined themes</span></div></div>
            <div className={styles.invitationCard}><span className={styles.cardIcon}><Icon name="mail" /></span><p className={styles.eyebrow}>A personal invitation</p><h3>Dear Rajesh,<br />we’d love to celebrate with you.</h3><p>You’re invited to our Wedding and Reception.</p><div className={styles.invitationRsvp}><Icon name="check" /><span>Attending with 3 people</span></div><div className={styles.invitationPrivacy}><Icon name="lock" /> Your unique link. No account needed.</div></div>
          </div><div className={styles.previewCaption}><SampleLabel /><span>Wedding websites share general details. Private invitations show each guest’s invited events.</span></div>
          <div className={styles.livestreamNote}><Icon name="play" /><p>For loved ones celebrating from afar, include a <strong>YouTube livestream</strong> on your wedding website.</p></div>
        </div></section>

        <section id="memories" className={`${styles.container} ${styles.memoriesSection}`} aria-labelledby="memories-title">
          <div className={styles.memoriesHeading}><div><p className={styles.eyebrow}>The wedding ends. The memories stay.</p><h2 id="memories-title">Every perspective.<br />One beautiful collection.</h2><p className={styles.description}>The big moments and the little in-between ones. Bring your family’s photos into a private gallery, with albums for each celebration.</p></div><div className={styles.qrNote}><Icon name="qr" /><div><strong>Scan. Share. Remember.</strong><p>Guests can view and upload photos through a gallery link or QR code. No account needed.</p></div></div></div>
          <div className={styles.memoryImage}><Image src={reception} alt="A bride and groom celebrating at a candlelit palace reception with family and friends" fill sizes="(max-width: 760px) 92vw, (max-width: 1280px) 88vw, 1160px" placeholder="blur" /><div className={styles.memoryShade} /><div><p className={styles.microLabel}>From every phone, to one shared memory</p><h3>A night you’ll always come back to.</h3></div></div>
        </section>

        <section id="how-it-works" className={styles.howSection} aria-labelledby="how-title"><div className={styles.container}><div className={styles.centerHeading}><p className={styles.eyebrow}>A beautiful beginning, in a few simple steps</p><h2 id="how-title">Less to juggle. More to enjoy.</h2><p className={styles.sectionDescription}>A shared wedding workspace, from the first plans to the last dance.</p></div><ol className={styles.steps}>{[
          ["Create your wedding", "Start with your names, wedding date, and location. Give your celebrations a place to come together."],
          ["Bring your family together", "Invite family members to help. Organise events, assign tasks, and keep everyone on the same page."],
          ["Welcome your guests", "Send invitations by email or share links on WhatsApp. Collect RSVPs without asking guests to sign up."],
          ["Celebrate & remember", "Keep track of expenses and vendors, share your wedding website, and collect photos from your loved ones."],
        ].map(([title, copy], i) => <li key={title}><span className={styles.stepNumber}>0{i + 1}</span><h3>{title}</h3><p>{copy}</p></li>)}</ol></div></section>

        <section className={styles.promise} aria-label="Our promise"><Icon name="flower" /><p className={styles.microLabel}>At the heart of it all</p><h2>One celebration. Hundreds of details.<br />One place to bring it all together.</h2><p>Made for the families who make a wedding.</p></section>

        <section className={`${styles.container} ${styles.finalCta}`} aria-labelledby="begin-title"><p className={styles.eyebrow}>Your story starts here</p><h2 id="begin-title">Begin planning something<br />unforgettable.</h2><p className={styles.sectionDescription}>A little less coordination. A little more celebration.<br />A beautiful space for the people who matter most.</p><div className={styles.heroActions}><AccessButton className={styles.primaryButton}>Create your wedding <Icon name="heart" /></AccessButton><AccessButton className={styles.secondaryButton} intent="login">Log in to your wedding <Icon name="arrow" /></AccessButton></div><p className={styles.launchNote}>Start with your account · Built around your family</p></section>
      </main>
      <footer className={styles.footer}><div className={styles.container}><div className={styles.footerTop}><a href="#main-content" className={styles.footerBrand}>Make My Marriage<span>Beautifully organized. Lovingly shared.</span></a><nav aria-label="Footer"><a href="#features">Features</a><a href="#how-it-works">How it works</a><a href="#wedding-website">Wedding website</a><a href="#memories">Memories</a></nav></div><div className={styles.footerBottom}><span>© {new Date().getFullYear()} Make My Marriage</span><span>Made for many celebrations. And one beautiful beginning.</span></div></div></footer>
    </>
  );
}
