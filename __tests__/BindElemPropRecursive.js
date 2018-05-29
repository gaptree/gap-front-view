import {View} from '../index';

class BookView extends View {
    template() {
        return this.html`
        <span class="author-name"
            bind-html="book.author.name"></span>
        `;
    }

    setAuthorName(name) {
        this.data.book.author.name = name;
    }
}

test('bind elem prop recursive', () => {
    const bookView = new BookView({
        book: {
            author: {
                name: 'mike'
            }
        }
    });

    bookView.appendTo(document.body);

    const authorNameSpan = document.querySelector('.author-name');

    expect(authorNameSpan.innerHTML).toBe('mike');

    bookView.setAuthorName('tom');
    expect(authorNameSpan.innerHTML).toBe('tom');

    bookView.update({
        book: {
            author: {
                name: 'sam'
            }
        }
    });
    expect(authorNameSpan.innerHTML).toBe('sam');
});