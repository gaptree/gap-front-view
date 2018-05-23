import {deepAssign} from '../index';

test('deepAssign', () => {
    const data = {
        a: 1,
        b: {
            b1: true,
            b2: 12,
            b3: {
                bb1: 'bb1',
                bb2: {
                    bbb1: 'bbb1'
                }
            }
        },
        c: true,
        d: '1234'
    };

    deepAssign(data, {
        b: {
            b2: 123,
            b3: {
                bb1: 'bb1-changed',
                bb2: {
                    bbb2: 'bbb2'
                }
            }
        }
    });

    expect(data).toEqual({
        a: 1,
        b: {
            b1: true,
            b2: 123,
            b3: {
                bb1: 'bb1-changed',
                bb2: {
                    bbb1: 'bbb1',
                    bbb2: 'bbb2'
                }
            }
        },
        c: true,
        d: '1234'
    });
});
