import { describe, expectTypeOf, it } from 'vitest'
import type { IconName } from 'virtual:usesvelte/inline-svg'

// The declaration the vite plugin generates turns the icons of the directory into the Icon union
// of the virtual module, importable wherever the consumer needs it.
describe('the icons virtual module', () => {
  it('types the icons that exist as a union, not as a string', () => {
    expectTypeOf<IconName>().toEqualTypeOf<'check' | 'frontend/svelte'>()
    expectTypeOf<IconName[]>().toEqualTypeOf<('check' | 'frontend/svelte')[]>()
  })

  it('is usable to type a name passed to the component', () => {
    const props: { name: IconName } = { name: 'frontend/svelte' }

    expectTypeOf(props.name).toEqualTypeOf<'check' | 'frontend/svelte'>()
  })
})
