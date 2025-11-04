import type React from "react"
import { ThemeProvider } from "@/components/shared"
// import { Inter } from "next/font/google"
import './globals.css'
// import "plyr-react/plyr.css";
// const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  metadataBase: new URL('https://filippodesvila.vercel.app'),
  title: "Filippo De Silva | Fullstack Developer Portfolio",
  description:
    "Explore my curated collection of professional web development projects showcasing full-stack expertise in building robust applications.",
  generator: 'Next.js',
  keywords: ['Fullstack Developer', 'Web Development','Filippo De Silva', 'Samuel Dagnachew', 'Web Developer',
    'Next.js', 'Nextjs', 'Next.js Fullstack Developer', 'Nextjs Fullstack Developer', 
    'Next.js Developer', 'Nextjs Developer', 'Java', 'Python', 'Python Developer', 
    'Java Developer', 'Node.js', 'Nodejs', 'Node.js Developer', 'Nodejs Developer', 
    'MERN Developer', 'AI Engineer', 'AI Developer', 'Flutter Developer', 'React Native Developer', 'Express Developer',],
  author: 'Filippo De Silva',

  //  Open Graph tags
   ogTitle: "Filippo De Silva - Fullstack Developer Portfolio",
   ogDescription:
     "Explore my curated collection of professional web development projects showcasing full-stack expertise in building robust applications.",
   ogUrl: 'https://www.filippodesilva.vercel.app',
   ogImage: '/path/to/og-image.jpg',
   ogType: 'website', // You can use other types like article, profile, etc., depending on the page's content.
  canonical: 'https://www.filippodesilva.vercel.app',

   // Twitter Card data
  twitterCard: 'summary_large_image',
  twitterTitle: "Filippo De Silva - Fullstack Developer Portfolio",
  twitterDescription:
    "Explore my curated collection of professional web development projects showcasing full-stack expertise in building robust applications.",
  twitterImage: '/path/to/twitter-image.jpg',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Oxygen:wght@300;400;700&family=Space+Grotesk:wght@300..700&family=Fira+Sans+Condensed:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Unbounded:wght@200..900&family=Philosopher:ital,wght@0,400;0,700;1,400;1,700&family=Noto+Serif:ital,wght@0,100..900;1,100..900&family=Old+Standard+TT:ital,wght@0,400;0,700;1,400&family=Almendra:ital,wght@0,400;0,700;1,400;1,700&family=Sixtyfour&family=Rubik+80s+Fade&family=Tourney:ital,wght@0,100..900;1,100..900&family=Monoton&family=Dancing+Script:wght@400..700&family=Caveat:wght@400..700&family=Pacifico&family=Shadows+Into+Light&family=Indie+Flower&family=Permanent+Marker&family=Architects+Daughter&family=Cabin+Sketch:wght@400;700&family=Lobster+Two:ital,wght@0,400;0,700;1,400;1,700&family=Great+Vibes&family=Oleo+Script:wght@400;700&family=Kaushan+Script&family=WindSong:wght@400;500&family=Aguafina+Script&family=Vujahday+Script&family=Homemade+Apple&family=Jersey+10&family=Gravitas+One&family=Freckle+Face&family=Trade+Winds&family=Aladin&family=Sancreek&family=Kode+Mono:wght@400..700&family=Special+Elite&family=Bungee+Tint&family=Bungee+Spice&family=Faster+One&family=New+Rocker&family=Metal+Mania&family=Rubik+Glitch&family=Creepster&family=Butcherman&family=Eater&family=Nosifer&family=Londrina+Sketch:wght@400;700&family=Menbere&family=Codystar:wght@300;400&family=Nova+Script&family=Water+Brush&family=Neonderthaw&family=Love+Light&family=Cherish&family=Splash&family=Matemasie&family=Nabla&family=Road+Rage&family=Jolly+Lodger&family=Germania+One&family=Lemon&family=Akronim&family=Rubik+Moonrocks&family=Astloch&family=Piedra&family=Miltonian&family=Rubik+Scribble&family=Londrina+Shadow&family=Arbutus&family=Zen+Tokyo+Zoo&family=Almendra+Display&family=Alumni+Sans+Pinstripe&family=Jacquard+12&family=Bitcount+Prop+Double&family=Plaster&family=New+Amsterdam&family=Lugrasimo&family=Bungee+Outline&family=Jersey+20&family=Griffy&family=Tulpen+One&family=Rubik+Distressed&family=Kumar+One+Outline&family=Arsenal+SC&family=Flavors&family=Jim+Nightshade&family=Rubik+Vinyl&family=Bonbon&family=Trochut&family=Rubik+Gemstones&family=Hanalei+Fill&family=Edu+VIC+WA+NT+Beginner&family=Purple+Purse&family=Bruno+Ace+SC&family=Foldit&family=Alumni+Sans+Inline+One&family=Emblema+One&family=Oldenburg&family=Wittgenstein&family=Rubik+Glitch+Pop&family=GFS+Neohellenic&family=Jacquard+24&family=Rubik+Beastly&family=Rubik+Microbe&family=Ruge+Boogie&family=Protest+Guerrilla&family=Rubik+Puddles&family=Moo+Lah+Lah&family=Rubik+Marker+Hatch&family=Labrada&family=Workbench&family=Kalnia+Glaze&family=Sixtyfour+Convergence&family=Hanalei&family=Rubik+Maps&family=Rubik+Doodle+Triangles&family=Jacquard+12+Charted&family=Jersey+25+Charted&family=Rubik+Storm&family=Rubik+Maze&family=Rubik+Lines&family=Abyssinica+SIL&family=Noto+Color+Emoji&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body 
      // className={inter.className}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
