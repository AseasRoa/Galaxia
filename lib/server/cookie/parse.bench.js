import { bench, describe } from 'vitest'
import { parse } from './index.js'

describe('parse', () => {
  bench('simple', () => {
    parse('foo=bar')
  })

  bench('decode', () => {
    parse('foo=hello%20there!')
  })

  bench('unquote', () => {
    parse('foo="foo bar"')
  })

  const duplicates = `${genCookies(2)}; ${genCookies(2)}`
  bench('duplicates', () => {
    parse(duplicates)
  })

  const cookies10 = genCookies(10)
  bench('10 cookies', () => {
    parse(cookies10)
  })

  const cookies100 = genCookies(100)
  bench('100 cookies', () => {
    parse(cookies100)
  })
})

describe('parse top-sites', () => {
  const top = {
    'accounts.google.com': '__Aaaa-AAAA=0:0AaaAaaaAAA0aA0aAA0aaAaAAaaaAA:AAAaAA0AAAaAAa0a',
    'amazon.com': 'aaaaaaa-aa=000-0000000-0000000; bbbbbbb-bb-bbbb=1111111111b; c22c-ccccc=CCC; dddd=dddddd',
    'apple.com': 'aaa=AA',
    'cloudflare.com': '__aa_aa=aaA0aaAAaAaaaa0aaaaAAAA_0aa0a.0AAA000aAA0aa-0000000000-0.0.0.0-Aaa00aA0aaAaAA0AaaAAAA0AaAaaaAAA.AaAaAaAA_0aAaAaaAA0AAAAaaAaaaaA0aaAAAaAAAaaaaa0AAa0AAAAAaaA0aaA0a0aaaaaAAA',
    'docs.google.com': '__Aaaa-AAAA=0:aAAaA00AA0A0AAaAAAaAAAAAaA_AAA:aAAA00AAaaAAaaAA',
    'drive.google.com': '__Aaaa-AAAA=0:AA0a0AAaaAaaA0A-AAAA0aaA_0A-aa:0aaAa0aA0aaAAAAa',
    'en.wikipedia.org': 'AAA-Aaaa-Aaaaaa=00-Aaa-0000; BBB-Bbbb-Bbbbbb-Bbbbbb=11-Bbb-1111; CCC-CC=222; DddDD=DD:DD:Ddd_Ddddddddd:33.33:-333.33:d3; EeeeeeeEeeeeEeeee=4.444',
    'istockphoto.com': 'aaaaaaa=aAAAAAAaAAAaaa0aa0aAAAa0aAaaaAAA0A%22aaA0aAaaAaa0AAaaaaAAaAaaa0AaaaA%2200a0a00AA00A0aAaAaA0aa%22AAaaAA0000aAa00%220AaAaAAA0AaaAaAAAaaaAaAAa00AaAa0AaaaAaAaAaaaaaaa%22aAaaaAaaAaaaAAAAaAAaaAAaAaaAaaaAAa0A%22--aaA0aaAAAAAaaAAa--a0a%22A%22aAAaAAAa%22AaaAaAA%22%22; bbb=bb=1&bb=1111-11-11B11%2211%2211B; ccc=ccc=22222ccc-2c22-2c22-2222-22c2222c2222; ddd=d=DD%22dDddddDdddD3ddDddd33dddD3dDD33dDd3DDdDdddDdD33D3Dd33DDdd3dDd3dDDdDDDdD3dD3d3D3dDDdd3dddD%223DDDDdd3dD3ddd3dddDdDdD33D3DdDDd3dD3dDddDDdDdDDDdDDDDDDdddDdDdDdD3dddDDDd3DDD3D%22%2233d%22D3DDDDdDDDDDddddDDDdd3DdDDdDDDDdDdddd3ddD3D3DDddd3ddD3D3DDddDddDDDd3DDDDDdD3DDddDdDdDDD3DDDdDDddDDDdDDD3DD33DDddDDD3DDDdDDDdDDD3DDdD%223%223%223&d; eeee=e=eEEEeEee44eE4eeEEeeEEEeEE4444eeE4eE4eEE4%224e%22',
    'maps.google.com': 'AAA=000=aaaaAa0Aaa0aaaaaaaaaaAAAAAAaaaaAAA0AaAAA0aaaA00AAA0aAAAA0aaA0aAAAAaAAA0aAAAAaaAAaa_AAAAAaA0a0aaaAaaaaa--aa0aAAA0A0AaAA0AAaaAAa0AaAAa0A_aAAAAaAA_aAaAa0AaA0aAa0Aa-AAa0aaaAAaAA-AaaaA0aaAaAA0aaaa',
    'play.google.com': 'AAA=000=A0AaA-aaaA00AaAAa00A0aaAAaA0AaAaaaa0A_Aa0_AaaAAAaAaa0aa0a-0aAaA0__AaAAaaaaAAaaaaaAAaaa0aAAAa0a_a0aaAAAAAaAaa0aaaaaAaaaaAAA_aAa0aaa0aaa00aaAAAaA0AAAAa00A0A0AaAaA0AAA0A0AAaAA0aaAAa',
    'policies.google.com': 'AAA=000=AaAAAA_aAAa0aAaaaaAAa000A0AAaAaAAaAaaAa00-0aAaaAAaaAAAA0a0aaA0AaAaaaaaaaaAAAA0a0AAa_AaaAaaaAa_aaAAAaa00aAAAAAA_AAAAa0aA0a0AaA_00A0-0AaA-A_AAaA00aaAAAAAAaAaAaaaa0aaAAa0AaaA0aaAaaa',
    'pt.wikipedia.org': 'AAA-Aaaa-Aaaaaa=00-Aaa-0000; BBB-Bbbb-Bbbbbb-Bbbbbb=11-Bbb-1111; CccCC=CC:CC:Ccc_Ccccccccc:22.22:-222.22:c2; DddddddDddddDdddd=3.333',
    'sites.google.com': '__Aaaa-AAAA=0:aaaAaAAA0aAAaAAAaAaaAaa0A00AAA:aAAaaaAA_aa0A0aA',
    'support.google.com': 'AAA=000=aaAAAaaAaaaAaA0aAA-00-AAaA0Aa0A0aaaAaaAa00_aAAAAAaaA0AAa0AAA0aAaA0aA0A0AAAAA0A0aaAAAA0aa-AAaAa00a0AaaaAaaAaa0Aaa0AA0aAAaaaaaAAAaAAAA0AA0AAaaaAa0aAAAaaaaaaAAA_0aaAaaAA0AaA0a0a0aAaA; BBB=111=bbBBBbbBbbbBbB1bBB-11-BBbB1Bb1B1bbbBbbBb11_bBBBBBbbB1BBb1BBB1bBbB1bB1B1BBBBB1B1bbBBBB1bb-BBbBb11b1BbbbBbbBbb1Bbb1BB1bBBbbbbbBBBbBBBB1BB1BBbbbBb1bBBBbbbbbbBBB_1bbBbbBB1BbB1b1b1bBbB',
    't.me': 'aaaa_aaaa=aa0a00a00a000000a0_0000000000000000000',
    'vk.com': 'aaaaaaa=AAAAAAA; bbbbbbbbb=1; cccccccccc=2222222222222222222_CcCCccCCccc2CcCcCCCccCCCCccc2CccCC2cc2CcCCc; ddddddd=DDDDDDD; eeeeeEEEE=EEEEEEE; fffffffff=5555555555_fFfFffFfffFF55FF5ffffF5ffFFfff5f5F55FfF5fFF; ggggggg=-6%22-6%22-6%226666666666; hhhhhhh=7; iiiiiii=-8%22-8%22-8%228888888888',
    'www.google.com': 'AAA=AAAA0aaA00aaAaA-aaA0AaAaaAaa0aaAaAaaAAaA0AA00A0aAaAAAA0aaA; BBB=111=bbb111bBBb11-bbbBbbBBb11BbBB1bbb-bbBbbBBBbb-bbbb1BBbBBbbbb_bBb1BbbBBB1B1bBbb1b11bbBB11B11BBbBbbBB11BBBbb1b-BBbBBbBbBBB11bBbBB1BbbBBBBbbBbbBBbbB1b1bBb1B_BBb1BBB1bB1BbBBBbb1bB11b1bbbBBbbBbBBBbbbBBBb',
    'youtu.be': 'AAA=0; BBB=bbbBbBbbbbb; CCCCCCC_CCCC2_CCCC=Cccc-cCCcCC; DDDDDDD_DDDDDDD_DDDDDDDD=DdDDDdDDDdDdDD%22%22',
    'youtube.com': 'AAA=0; BBB=BbBbbbb1bBb; CCCCCCC_CCCC2_CCCC=CCc2ccCccCc; DDDDDDD_DDDDDDD_DDDDDDDD=DdDDDdDDDdDdDd%22%22',
    'example.com': ''
  }

  Object.entries(top).forEach(([domain, value]) => {
    bench(`parse ${domain}`, () => {
      parse(value)
    })
  })
})

/**
 * @param {number} num
 * @returns {string}
 */
function genCookies(num) {
  let str = ''

  for (let i = 0; i < num; i++) {
    str += `; foo${i}=bar`
  }

  return str.slice(2)
}
