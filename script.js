var products = [
    { id: 1, nama: 'Beras Premium 5 kg', kategori: 'beras', harga: 95000, hargaAsli: 105000, gambar: 'beras-premium.jpg', ikon: '🌾' },
    { id: 2, nama: 'Tepung Terigu 1 kg', kategori: 'beras', harga: 15000, gambar: 'tepung-terigu.jpg', ikon: '🌾' },
    { id: 3, nama: 'Gula Pasir 1 kg', kategori: 'gula', harga: 17000, gambar: 'gula.jpg', ikon: '🍯' },
    { id: 4, nama: 'Minyak Goreng 2 L', kategori: 'minyak', harga: 36000, hargaAsli: 39000, gambar: 'minyak-2l.jpg', ikon: '🛢️' },
    { id: 5, nama: 'Telur Ayam 1 kg', kategori: 'telur', harga: 32000, gambar: 'telur.jpg', ikon: '🥚' },
    { id: 6, nama: 'Mi Instan Goreng (5 pcs)', kategori: 'mie', harga: 20000, gambar: 'mie-goreng.jpg', ikon: '🍜' },
    { id: 7, nama: 'Kopi Bubuk 200 g', kategori: 'kopi', harga: 35000, hargaAsli: 40000, gambar: 'kopi-bubuk.jpg', ikon: '☕' },
    { id: 8, nama: 'Teh Celup (25 pcs)', kategori: 'kopi', harga: 13500, gambar: 'teh-celup.jpg', ikon: '☕' },
    { id: 9, nama: 'Susu UHT 1 L', kategori: 'susu', harga: 20000, hargaAsli: 25000, gambar: 'susu.jpg', ikon: '🥛' },
    { id: 10, nama: 'Roti Tawar', kategori: 'roti', harga: 15000, gambar: 'roti.jpg', ikon: '🍞' },
    { id: 11, nama: 'Shampoo', kategori: 'perawatan', harga: 25000, gambar: 'shampoo.jpg', ikon: '🧴' },
    { id: 12, nama: 'Sabun Mandi', kategori: 'perawatan', harga: 32000, gambar: 'sabun.jpg', ikon: '🧼' },
    { id: 13, nama: 'Pasta Gigi', kategori: 'perawatan', harga: 8000, gambar: 'pasta-gigi.jpg', ikon: '🪥' },
];

var NOMOR_WA = '6281234567890';

var cart = loadCart();
var filter = { kategori: 'semua', kata: '', urut: 'default' };

var $list = document.getElementById('product-list');
var $empty = document.getElementById('empty-state');
var $count = document.getElementById('cart-count');
var $drawer = document.getElementById('cart-drawer');
var $overlay = document.getElementById('overlay');
var $items = document.getElementById('cart-items');
var $total = document.getElementById('cart-total');
var $toast = document.getElementById('toast');

function rupiah(n) {
    return 'Rp ' + n.toLocaleString('id-ID');
}

function loadCart() {
    try { return JSON.parse(localStorage.getItem('cartSembako')) || []; }
    catch (e) { return []; }
}

function saveCart() {
    localStorage.setItem('cartSembako', JSON.stringify(cart));
}

function findProduct(id) {
    return products.filter(function (p) { return p.id === id; })[0];
}

function showToast(text) {
    $toast.textContent = text;
    $toast.classList.add('show');
    clearTimeout(showToast.t);
    showToast.t = setTimeout(function () { $toast.classList.remove('show'); }, 1800);
}

function getVisibleProducts() {
    var hasil = products.filter(function (p) {
        var cocokKat = filter.kategori === 'semua' || p.kategori === filter.kategori;
        var cocokKata = p.nama.toLowerCase().indexOf(filter.kata.toLowerCase()) !== -1;
        return cocokKat && cocokKata;
    });
    if (filter.urut === 'murah') hasil.sort(function (a, b) { return a.harga - b.harga; });
    if (filter.urut === 'mahal') hasil.sort(function (a, b) { return b.harga - a.harga; });
    return hasil;
}

function renderProducts() {
    var data = getVisibleProducts();
    $list.innerHTML = data.map(function (p) {
        var diskon = p.hargaAsli ? Math.round((1 - p.harga / p.hargaAsli) * 100) : 0;
        return '<article class="product-item">' +
            (diskon ? '<span class="badge">-' + diskon + '%</span>' : '') +
            '<div class="thumb"><img src="' + p.gambar + '" alt="' + p.nama + '" loading="lazy" referrerpolicy="no-referrer" ' +
            'onerror="this.replaceWith(Object.assign(document.createElement(\'span\'),{className:\'thumb-icon\',textContent:\'' + p.ikon + '\'}))"></div>' +
            '<h3>' + p.nama + '</h3>' +
            '<p class="price">' + rupiah(p.harga) + (p.hargaAsli ? ' <s>' + rupiah(p.hargaAsli) + '</s>' : '') + '</p>' +
            '<button class="btn" data-add="' + p.id + '">Tambah ke keranjang</button>' +
            '</article>';
    }).join('');
    $empty.hidden = data.length > 0;

    document.querySelectorAll('.cat').forEach(function (c) {
        c.classList.toggle('active', c.dataset.cat === filter.kategori);
    });
}

function addToCart(id) {
    var item = cart.filter(function (c) { return c.id === id; })[0];
    if (item) item.qty++;
    else cart.push({ id: id, qty: 1 });
    saveCart();
    renderCart();
    showToast(findProduct(id).nama + ' ditambahkan');
}

function changeQty(id, delta) {
    cart.forEach(function (c) { if (c.id === id) c.qty += delta; });
    cart = cart.filter(function (c) { return c.qty > 0; });
    saveCart();
    renderCart();
}

function cartTotal() {
    return cart.reduce(function (sum, c) { return sum + findProduct(c.id).harga * c.qty; }, 0);
}

function renderCart() {
    var jumlah = cart.reduce(function (s, c) { return s + c.qty; }, 0);
    $count.textContent = jumlah;

    if (cart.length === 0) {
        $items.innerHTML = '<p class="cart-empty">Keranjang masih kosong. Pilih produk dulu, ya.</p>';
    } else {
        $items.innerHTML = cart.map(function (c) {
            var p = findProduct(c.id);
            return '<div class="cart-row">' +
                '<div><strong>' + p.nama + '</strong><br><small>' + rupiah(p.harga) + '</small></div>' +
                '<div class="qty">' +
                '<button data-qty="-1" data-id="' + p.id + '" aria-label="Kurangi">-</button>' +
                '<span>' + c.qty + '</span>' +
                '<button data-qty="1" data-id="' + p.id + '" aria-label="Tambah">+</button>' +
                '</div></div>';
        }).join('');
    }
    $total.textContent = rupiah(cartTotal());
}

function openCart(buka) {
    $drawer.classList.toggle('open', buka);
    $overlay.classList.toggle('show', buka);
}

function checkout() {
    if (cart.length === 0) { showToast('Keranjang masih kosong'); return; }
    var pesan = 'Halo Toko Sembako, saya ingin memesan:\n';
    cart.forEach(function (c) {
        var p = findProduct(c.id);
        pesan += '- ' + p.nama + ' x' + c.qty + ' = ' + rupiah(p.harga * c.qty) + '\n';
    });
    pesan += 'Total: ' + rupiah(cartTotal());
    window.open('https://wa.me/' + NOMOR_WA + '?text=' + encodeURIComponent(pesan), '_blank');
}

document.addEventListener('click', function (e) {
    var add = e.target.closest('[data-add]');
    if (add) addToCart(Number(add.dataset.add));

    var qty = e.target.closest('[data-qty]');
    if (qty) changeQty(Number(qty.dataset.id), Number(qty.dataset.qty));

    var cat = e.target.closest('.cat');
    if (cat) {
        filter.kategori = filter.kategori === cat.dataset.cat ? 'semua' : cat.dataset.cat;
        renderProducts();
        document.getElementById('produk').scrollIntoView({ behavior: 'smooth' });
    }
});

document.getElementById('search-input').addEventListener('input', function (e) {
    filter.kata = e.target.value;
    renderProducts();
});
document.getElementById('sort-select').addEventListener('change', function (e) {
    filter.urut = e.target.value;
    renderProducts();
});
document.getElementById('reset-filter').addEventListener('click', function () {
    filter = { kategori: 'semua', kata: '', urut: 'default' };
    document.getElementById('search-input').value = '';
    document.getElementById('sort-select').value = 'default';
    renderProducts();
});
document.getElementById('open-cart').addEventListener('click', function (e) { e.preventDefault(); openCart(true); });
document.getElementById('close-cart').addEventListener('click', function () { openCart(false); });
$overlay.addEventListener('click', function () { openCart(false); });
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') openCart(false); });
document.getElementById('checkout-btn').addEventListener('click', checkout);
document.getElementById('clear-cart').addEventListener('click', function () {
    cart = []; saveCart(); renderCart();
});
document.querySelector('.search').addEventListener('submit', function (e) { e.preventDefault(); });

renderProducts();
renderCart();
