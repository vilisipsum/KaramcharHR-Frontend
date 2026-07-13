import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Column,
  Text,
  Button,
  Heading,
  Hr,
  Img,
  Link,
  Row,
} from '@react-email/components'
import * as React from 'react'

export interface EmailLayoutProps {
  children: React.ReactNode
  previewText?: string
  companyName?: string
}

export function EmailLayout({ children, previewText = '', companyName = 'KaramcharHR' }: EmailLayoutProps) {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
      </Head>
      <Preview>{previewText}</Preview>
      <Body style={mainStyles}>
        <Container style={containerStyles}>
          <Section style={headerStyles}>
            <Column>
              <Link href="#" style={logoStyles}>
                <Text style={logoTextStyles}>{companyName}</Text>
              </Link>
            </Column>
          </Section>
          
          <Section style={contentWrapperStyles}>
            <Column style={contentColumnStyles}>
              {children}
            </Column>
          </Section>

          <Section style={footerStyles}>
            <Column>
              <Hr style={hrStyles} />
              <Section style={footerContentStyles}>
                <Column>
                  <Text style={footerTextStyles}>
                    © {new Date().getFullYear()} {companyName}. All rights reserved.
                  </Text>
                  <Text style={footerTextStyles}>
                    This email was sent to you because you have an account with {companyName}.
                  </Text>
                </Column>
              </Section>
            </Column>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const mainStyles: React.CSSProperties = {
  margin: 0,
  padding: 0,
  backgroundColor: '#f3f4f6',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  lineHeight: 1.5,
}

const containerStyles: React.CSSProperties = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
}

const headerStyles: React.CSSProperties = {
  padding: '32px 24px 16px',
  textAlign: 'center',
  backgroundColor: '#fafafa',
  borderBottom: '1px solid #e5e7eb',
}

const logoStyles: React.CSSProperties = {
  textDecoration: 'none',
  color: '#92400e',
}

const logoTextStyles: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: '700',
  letterSpacing: '-0.02em',
  color: '#92400e',
}

const contentWrapperStyles: React.CSSProperties = {
  padding: '32px 24px',
}

const contentColumnStyles: React.CSSProperties = {
  width: '100%',
}

const footerStyles: React.CSSProperties = {
  padding: '24px',
  backgroundColor: '#fafafa',
  borderTop: '1px solid #e5e7eb',
}

const hrStyles: React.CSSProperties = {
  borderColor: '#e5e7eb',
  marginBottom: '16px',
}

const footerContentStyles: React.CSSProperties = {
  textAlign: 'center',
}

const footerTextStyles: React.CSSProperties = {
  fontSize: '12px',
  color: '#9ca3af',
  marginBottom: '8px',
  lineHeight: 1.5,
}
