'use strict'

$(document).ready(function () {
    // Init default config 
    const config = {
        themeToggleButton: '#theme-toggle-button',
        theme: 'light'
    }

    function initialsName() {
        // Render profile image with initials of your name
        let initials = ($('.profile__name').text() || '').match(/(\b\S)?/g).join('').match(/(^\S|\S$)?/g).join('').toUpperCase()

        let canvas = document.createElement('canvas')
        canvas.width = 144
        canvas.height = 144

        let ctx = canvas.getContext('2d')
        ctx.font = '500 48px Arial'
        ctx.textBaseline = 'middle'
        ctx.textAlign = 'center'

        ctx.fillStyle = 'hsla(196, 100%, 45%, 0.875)'
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#FFFFFF'
        ctx.fillText(initials, canvas.width / 2, canvas.height / 2)

        let canvasUrl = canvas.toDataURL()
        $('.profile-picture__image').attr('src', canvasUrl)
    }

    function renderTheme() {
        // Get current theme and set it 
        if (config.theme === 'dark') {
            $('body').addClass('dark-theme')
            $(config.themeToggleButton).removeClass('ri-moon-line').addClass('ri-sun-line')
        } else {
            $('body').removeClass('dark-theme')
            $(config.themeToggleButton).removeClass('ri-sun-line').addClass('ri-moon-line')
        }
    }

    function toggleTheme() {
        // Add event listener to theme toggle button 
        $(document).on('click', config.themeToggleButton, function () {
            config.theme = config.theme === 'light' ? 'dark' : 'light'
            localStorage.setItem('theme', config.theme)
            renderTheme()
        })
    }

    function initTheme() {
        // Run this function when page is loaded
        if (localStorage.getItem('theme') === 'dark') {
            config.theme = 'dark'
        }
        renderTheme()
    }

    function customTabNav() {
        $(document).on('click', '.tab-nav > *', function () {
            try {
                // Toggle active class on tab nav button
                $('.tab-nav > *').removeClass('active')
                $(this).addClass('active')

                // Get the tab content from the parent element data-tab atribute
                const tabContentTarget = $(this).parent().data('tab')
                const tabContent = $(document).find(`#${tabContentTarget}`)
                if (!tabContent.length) return

                // Get the content from the data-content attribute
                const contentTarget = $(this).data('content')
                if (!contentTarget.length) return

                // Toggle "show" active class on tab content
                tabContent.find('.tab-content__item').removeClass('show')
                tabContent.find(`.tab-content__item#${contentTarget}`).addClass('show')
            } catch (error) {
                console.error(error)
            }
        })
    }

    function animations() {
        const scrollReveal = ScrollReveal(),
            revealFromTop = { delay: 250, duration: 500, origin: 'top', distance: '32px', easing: 'ease-out', scale: 1 }

        scrollReveal.reveal('.reveal-top', revealFromTop)
    }

    function init() {
        toggleTheme()
        initTheme()

        // initialsName()
        customTabNav()
        animations()
    }

    init()
})