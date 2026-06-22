import type { ThemeProps } from './_shared'
import { MinimalTheme }       from './minimal'
import { ModernDarkTheme }    from './modern-dark'
import { FashionPremiumTheme } from './fashion-premium'
import { CreativeGridTheme }  from './creative-grid'

export type { ThemeProps }

export type ThemeComponent = (props: ThemeProps) => JSX.Element

export const THEME_COMPONENTS: Record<string, ThemeComponent> = {
  'minimal':          MinimalTheme,
  'modern-dark':      ModernDarkTheme,
  'fashion-premium':  FashionPremiumTheme,
  'creative-grid':    CreativeGridTheme,
}
