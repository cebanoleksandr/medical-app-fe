import { styled } from '@mui/material/styles'
import { SectionHeader } from '../../components/landing/SectionHeader'
import { ContactInfo } from '../../components/landing/contact/ContactInfo'
import { ContactPanel } from '../../components/landing/contact/ContactPanel'
import { contactBorder } from '../../components/landing/contact/styles'
import { Container, TABLET, sectionPadding } from '../../components/layouts/landing/styles'

const Root = styled('section')(sectionPadding)

const Inner = styled(Container)({
  display: 'flex',
  flexDirection: 'column',
  gap: 48,
  [TABLET]: { gap: 32 },
})

const Body = styled('div')({
  display: 'flex',
  alignItems: 'stretch',
  padding: '32px 0',
  borderTop: contactBorder,
  // The 787px form panel doesn't fit next to the info column.
  [TABLET]: { flexDirection: 'column', gap: 24 },
})

const ContactUsPage = () => {
  return (
    <Root>
      <Inner>
        <SectionHeader
          title="Contact Us"
          description="Have questions about data anonymization or compliance? We're here to help."
        />
        <Body>
          <ContactInfo />
          <ContactPanel />
        </Body>
      </Inner>
    </Root>
  )
}

export default ContactUsPage;
