const Category = require("../../model/Catogories/Category")
const appErr = require("../../utils/appErr")


//post category
const categoryCreateCtrl = async (req, res, next) => {
    const { title } = req.body
    try {
        const category = await Category.create({
            title,
            user: req.userAuth
        })
        res.json({
            status: 'Success',
            data: category
        })
    } catch (error) {
        return next(appErr(error.message))
    }
}

// fetch category
const fetchcategoryGetCtrl = async (req, res, next) => {
    try {
        const categories = await Category.find()
        res.json({
            status: 'Success',
            data: categories
        })
    } catch (error) {
        return next(appErr(error.message))
    }
}

// single category
const categoryGetCtrl = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id)
        res.json({
            status: 'Success',
            data: category
        })
    } catch (error) {
        return next(appErr(error.message))
    }
}

// delete category
const categoryDeleteCtrl = async (req, res, next) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id)
        res.json({
            status: 'Success',
            data: "Delete Successfully"
        })
    } catch (error) {
        return next(appErr(error.message))
    }
}

// updateCategory
const categoryUpdateCtrl = async (req, res, next) => {
    const { title } = req.body
    try {
        const category = await Category.findByIdAndUpdate(req.params.id,
            { title }, { new: true })
        res.json({
            status: 'Success',
            data: category
        })
    } catch (error) {
        return next(appErr(error.message))
    }
}


module.exports = {
    categoryCreateCtrl,
    categoryGetCtrl,
    categoryDeleteCtrl,
    categoryUpdateCtrl,
    fetchcategoryGetCtrl
}