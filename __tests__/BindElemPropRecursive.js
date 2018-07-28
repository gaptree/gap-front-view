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

    setAuthor(author) {
        this.data.book.author = author;
    }
}

test('bind elem prop recursive', () => {
    const bookView = new BookView();

    bookView.appendTo(document.body);
    bookView.update({
        book: {
            author: {
                name: 'mike'
            }
        }
    });

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

    bookView.setAuthor({
        name: 'jack'
    });
    expect(authorNameSpan.innerHTML).toBe('jack');
});
