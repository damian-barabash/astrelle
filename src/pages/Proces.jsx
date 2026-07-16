import { Page, Panel } from '../stack.jsx'
import { Band, ClayPlay, KilnBlock, GlazeBlock, ClayTypes, Footer } from '../sections.jsx'
import ProcessTimeline from '../blocks/ProcessTimeline.jsx'
import Shrink from '../blocks/Shrink.jsx'

export default function Proces() {
  return (
    <Page>
      <Panel><Band /></Panel>
      <Panel><ClayPlay /></Panel>
      <Panel><ProcessTimeline /></Panel>
      <Panel><Shrink /></Panel>
      <Panel><KilnBlock /></Panel>
      <Panel><GlazeBlock /></Panel>
      <Panel><ClayTypes /></Panel>
      <Panel><Footer /></Panel>
    </Page>
  )
}
