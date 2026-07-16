import { Page, Panel } from '../stack.jsx'
import { Invitation, Pricing, Footer } from '../sections.jsx'

export default function Cennik() {
  return (
    <Page>
      <Panel><Invitation /></Panel>
      <Panel><Pricing /></Panel>
      <Panel><Footer /></Panel>
    </Page>
  )
}
