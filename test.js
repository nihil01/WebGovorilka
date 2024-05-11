let data = [
    { user: 'You', message: 'Hello', date: '1.1.1.1' },
    { user: '29', message: 'ку', date: '12.05.24 | 2:13' },
    {
        user: '29',
        message: 'Ого хахахахаххахаха',
        date: '12.05.24 | 2:13'
    },
    { user: '29', message: 'Миринда, эт ты ?', date: '12.05.24 | 2:13' },
    { user: '29', message: 'Миринда, эт ты ?', date: '12.05.24 | 2:13' },
    { user: '32', message: 'Да, я', date: '12.05.24 | 2:13' },
    { user: '29', message: 'Воооо, круто', date: '12.05.24 | 2:13' },
    { user: '32', message: 'Знаю', date: '12.05.24 | 2:13' },
    { user: '', message: '', date: '' }
];

data.map(el => {
    if (el.user === '32') {
        el.user = "You";
    }else{
        el.user = "Abonent";
    }
    return data;
})

console.log(data)

