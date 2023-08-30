//const brypt
//const jwt
const login = async (req, res) => {
    try {
        const {email, password} = req.body;
        if(!email || !password) {
            return res.status(400).json({message: 'Пожалуйста, заполните обязательные поля'})
        }

        const user = await prisma.user.findFirst({
            where: {
                email,
            }
        });

        const isPassCorr = user && (await brypt.compare(password, user.password));
        const secretCode = process.env.JWT_SECRET;

        if (user && isPassCorr && secretCode) {
            res.status(200).json({
                id: user.id,
                email: user.email,
                name: user.name,
                token: jwt.sign({ id: user.id }, secretCode, { expresIn: '30d' })
            })
        } 
        if (user.email != email){
            return res.status(400).json({ message: 'Неверно введён email' })
        } 
        else {
            return res.status(400).json({ message: 'Неверно введён пароль' })
        }
    }   
    catch {
        return res.status(500).json({ message: 'Что-то пошло не так' })
    }
}

const register = async (req, res, next) => {
    try {
        const {email, password, name} = req.body;

        if(!email || !password || !name) {
            return res.status(400).json({ message: 'Пожалуйста, заполните все обязательные поля'})
        }

        const registUser = await prisma.user.findFirst({
            where: {
                email
            }
        });

        if (registUser) {
            return res.status(400).json({ message: 'Пользователь, с таким email уже существует'})
        }

        const creatingSalt = await brypt.genSalt(10);
        const hashedPassword = await brypt.hash(password, creatingSalt);

        const user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword
            }
        });
        //проверка пароля(сложность, кириллица)
        const secretCode = process.env.JWT_SECRET;

        if (user && secretCode) {
            res.status(201).json({
                id: user.id,
                email: user.email,
                name,
                token: jwt.sign({ id: user.id }, secret, { exiresIn: '30d' })
            })
        } else {
            return res.status(400).json({ message: 'Не удалось создать пользователя' })
        }
    } catch {
        res.status(500).json({ message: 'Что-то пошло не так' })
    }
}

const current = async (req, res) => {
    return res.status(200).json(req.user)
}

module.exports = {
    login,
    register,
    current
}