import {
    withPluginApi
} from 'discourse/lib/plugin-api';
import {
    relativeAge
} from 'discourse/lib/formatter';
import {
    iconHTML
} from 'discourse-common/lib/icon-library';
import User from 'discourse/models/user';
import TopicNavigationComponent from 'discourse/components/topic-navigation';
import ApplicationRoute from 'discourse/routes/application';
var x = (...a) => {
        a = ["%cDiscPage -", "color:grey", ...a];
        console.log(...a)
    },
    z = (...a) => {
        a = ["%cDiscPage Error -", "color:red", ...a];
        console.log(...a)
    },
    A = (...a) => {
        a = ["%cDiscPage Warning -", "color:orange", ...a];
        console.log(...a)
    },
    C = class extends Error {
        constructor(a) {
            super(a);
            this.constructor = C;
            this.__proto__ = C.prototype;
            this.message = a;
            this.name = "DiscpageError"
        }
    },
    D = (a, b) => {
        if (!a) throw new C(`Assertion Failed${b?" - "+b:""}`);
    };

function E(a, b, e, f, d = 0) {
    let l = (c, k) => {
            try {
                const g = b(a[d], d, a);
                g && g.then ? g.then(c).catch(k) : c(g)
            } catch (g) {
                k(g)
            }
        },
        h = (c, k) => () => E(a, b, c, k, ++d),
        p = (c, k) => d < a.length ? (new Promise(l)).then(h(c, k)).catch(k) : c();
    return e ? p(e, f) : new Promise(p)
}
var F = a => new Promise(b => {
    setTimeout(() => {
        b(void 0)
    }, a)
});

function H(a, b, e) {
    let f = d => F(e).then(() => a(d));
    try {
        return 0 === b ? Promise.reject(void 0) : Promise.resolve(a(b)).then(d => d || H(f, b - 1))
    } catch (d) {
        return Promise.reject(d)
    }
}
var I = /^[0-9]+$/,
    J = /^[0-9A-Za-z_]+$/;

function aa({
    a,
    s: b
}) {
    if (!I.test(a)) throw new C(`Invalid pageId "${a}"`);
    if (b && !J.test(b)) throw new C(`Invalid balloon id "${b}". Valid characters are: [0-9A-Za-z_].`);
    return b ? `${"dpg"}-${a}-${b}` : `${"dpg"}-${a}`
}

function K(a) {
    var b = a.split("-");
    if ("dpg" !== b.shift()) return null;
    a = b.shift();
    return I.test(a) ? (b = b.shift()) && !J.test(b) ? null : {
        a,
        s: b
    } : null
}

function L({
    method: a,
    path: b,
    I: e
}) {
    return new Promise((f, d) => {
        $.ajax({
            type: a,
            url: b,
            data: e,
            success: l => f(l)
        }).fail(l => d(l.responseText))
    })
}

function ba({
    tag: a
}) {
    return L({
        method: "GET",
        path: `/tags/${a}.json`
    }).then(b => b.topic_list.topics)
}

function ca({
    name: a,
    D: b,
    P: e = !1,
    R: f = !1
}) {
    L({
        method: "POST",
        path: "/tag_groups",
        I: {
            name: a,
            tag_names: b,
            one_per_topic: e,
            permissions: f ? {
                staff: 1
            } : void 0
        }
    })
}

function da({
    id: a,
    D: b
}) {
    L({
        method: "PUT",
        path: `/tag_groups/${a}.json`,
        I: {
            tag_names: b
        }
    })
}

function M(a, {
    f: b
}) {
    var e = $(a.left);
    e.find(".dpg-balloon-text, .dpg-subsec").removeClass("dpg-highlighted");
    b && (e = e.find(`.dpg-balloon-text[data-dpg-id=${b}]`), e.length ? (e.addClass("dpg-highlighted"), e.parent().is("h1,h2,h3,h4,h5,h6") && e.closest(".dpg-subsec").addClass("dpg-highlighted"), b = e[0].getBoundingClientRect(), a = a.left.getBoundingClientRect(), b.top < a.bottom && b.bottom >= a.top || e[0].scrollIntoView()) : A(`selected balloon "${b}" has not been found in page "${a.a}"`))
}

function N(a, {
    a: b,
    i: e,
    h: f,
    g: d,
    m: l,
    c: h,
    title: p,
    f: c
}) {
    D("string" == typeof b, `invalid pageId "${b}"`);
    h = h.replace("{dpg-show-rev-button}", "").replace("{dpg-title-balloon}", "");
    let k = $(`
      <div class="dpg-page-content">
        <div class="dpg-buttons ${"nodiff"!==d?"selected":""}">
          <div class="dpg-buttons-left"></div><div class="dpg-buttons-center"></div><div class="dpg-buttons-right"></div>        
        </div>
        <div class="dpg-header">
          <div class="dpg-header-1"><div class="dpg-header-2"><div class="dpg-header-3"></div></div></div>
        </div>
        <div class="dpg-body">
          <div class="wrap">
            <!-- <div class="posts-wrapper"> FIX FOR ISSUE https://github.com/sylque/discpage/issues/6 --> 
              <div class="topic-body">
                <!-- Cooked post to be inserted here -->
              </div>
            <!-- </div> -->
          </div>
        </div>
        <div class="dpg-footer">
          <div class="dpg-footer-1"><div class="dpg-footer-2"><div class="dpg-footer-3"></div></div></div>
        </div>
      </div>
    `);
    var g = a.c.includes("{dpg-title-balloon}") ? '<span class="dpg-balloon-text" data-dpg-id="title"></span>' : "";
    g = a.G.cooked(`<h1>${p+g}</h1>\n` + h).init();
    k.find(".dpg-body .topic-body").append(g);
    let u = a.j.siteSettings.force_lowercase_tags,
        t = a.j.siteSettings.max_tag_length;
    k.find(".dpg-badge").hide();
    let w = {};
    k.find(".dpg-balloon-text").each((m, q) => {
        let n, r = q.dataset.dpgId;
        m = $(q);
        try {
            if (!r) throw new C("Missing balloon id. The correct syntax is [dpgb id=something][/dpgb].");
            n = aa({
                a: b,
                s: r
            });
            if (n.length >
                t) throw new C(`Balloon id is too long. Resulting tag is \"${n}\", which has a length of ${n.length}. This doesn't fit max_tag_length=${t} in Discourse settings. Fix: either shorten the balloon id, or increase max_tag_length.`);
            if (u && n !== n.toLowerCase()) throw new C("Balloon id has uppercase. This doesn't fit force_lowercase_tags=true in Discourse settings. Fix: either make your balloon id all lowercase, or set force_lowercase_tags to false.");
            w[n] && A(`Duplicate balloon id "${n}". This is usually a bad idea.`)
        } catch (v) {
            if (v instanceof C) {
                z(v.message);
                m.append(`<span class="dpg-error" title="${v.message}">DiscPage Error</span>`);
                return
            }
            throw v;
        }
        w[n] = !0;
        if (0 === q.childNodes.length) {
            q = m.parent().is(".cooked,.dpg-subsec");
            let v = m.prev();
            q = q && v.length ? v : m.parent();
            m.detach();
            q.addClass("dpg-balloon-parent").wrapInner(m)
        } else m.wrap('<span class="dpg-balloon-parent" />'), q = m.parent();
        q.append(`
        <span class="dpg-icons" title="Click to discuss this part">
          <span class="dpg-balloon">${iconHTML("comment")}</span>
          <span class="dpg-badge" style="display:none">99</span>
        </span>
      `);
        q.is("h1,h2,h3,h4,h5,h6") && q.nextUntil("h1,h2,h3,h4,h5,h6").addBack().wrapAll('<div class="dpg-subsec"></div>');
        q.find(".dpg-icons").click(v => {
            a.j.get("router").transitionTo(`/tags/${n}`);
            M(a, {
                f: r
            });
            v.stopPropagation()
        })
    });
    let y = Object.keys(w);
    a.F && y.length && a.M.then(m => {
        let q = `dpg-${b}`;
        m = m.find(n => n.name === q);
        y.sort();
        m ? ea(m.J, y) || da({
            id: m.id,
            D: y
        }) : ca({
            name: q,
            D: y
        })
    });
    a.N.then(m => {
        m = m.reduce((q, n) => {
            if (n.count && n.parsed.a === b) {
                const r = k.find(`.dpg-balloon-text[data-dpg-id="${n.parsed.s}"]`);
                r.length ? (n.K = r.next().find(".dpg-badge"), q.push(n)) : A(`In page "${b}": missing balloon for tag "${n.id}"`)
            }
            return q
        }, []);
        E(m, q => ba({
            tag: q.id
        }).then(n => {
            (n = n.filter(r => r.visible).length) && q.K.text(n).show()
        }).then(() => F(250)))
    });
    g = k.find(".dpg-buttons-right");
    let B = k.find(".dpg-buttons-center");
    var G = a.c.includes("{dpg-show-rev-button}");
    if (!a.C && 1 < f && G) {
        let m = ({
                g: n,
                rev: r = null
            }) => {
                N(a, {
                    a: b,
                    i: e,
                    h: f,
                    g: n,
                    m: r ? r.created_at : void 0,
                    c: r ? r.body_changes.inline : a.c,
                    title: p,
                    f: c
                })
            },
            q = "nodiff" !== d;
        O({
            o: "history",
            title: "Show page revisions",
            id: "dpg-show-rev-nav"
        }).click(() => {
            q ? m({
                g: "nodiff"
            }) : P(`/posts/${e}/revisions/${f}.json`).then(n => {
                m({
                    g: f,
                    rev: n
                })
            })
        }).appendTo(g);
        if (q) {
            O({
                o: "backward",
                title: "Previous revisions",
                id: "dpg-prev-rev",
                disabled: 2 === d
            }).appendTo(B).click(() => {
                let r = d - 1;
                P(`/posts/${e}/revisions/${r}.json`).then(v => {
                    m({
                        g: r,
                        rev: v
                    })
                })
            });
            G = new Date(l);
            let n = relativeAge(G, {
                format: "medium-with-ago"
            });
            B.append(`<span class="dpg-date" title=${G}>${n}</span>`);
            O({
                o: "forward",
                title: "Next revision",
                id: "dpg-next-rev",
                disabled: d === f
            }).appendTo(B).click(() => {
                let r = d + 1;
                P(`/posts/${e}/revisions/${r}.json`).then(v => {
                    m({
                        g: r,
                        rev: v
                    })
                })
            })
        }
    }
    a.F && (O({
        o: "wrench",
        title: "Edit title",
        id: "dpg-edit-title-button"
    }).click(() => {
        $("html").toggleClass("dpg", !1);
        $("a.edit-topic").click();
        $("#main-outlet").click(m => {
            m.target.closest(".edit-controls .btn, .topic-admin-popup-menu .topic-admin-reset-bump-date, .topic-admin-popup-menu .topic-admin-visible") && (N(a, {
                a: b,
                i: e,
                h: f,
                g: d,
                m: l,
                c: h,
                title: $("input#edit-title").val(),
                f: c
            }), $("html").toggleClass("dpg", !0))
        })
    }).wrap("<div><div>").parent().appendTo(g), O({
        o: "pencil-alt",
        title: "Edit page",
        id: "dpg-edit-page-button"
    }).click(() => {
        let m = $("article#post_1 button.edit");
        m.length ? (m.click(), Q(a.C)) : ($("article#post_1 button.show-more-actions").click(), setTimeout(() => {
            $("article#post_1 button.edit").click();
            Q(a.C)
        }, 0))
    }).wrap("<div><div>").parent().appendTo(g));
    $(a.left).empty().append(k);
    M(a, {
        f: c
    });
    document.documentElement.dispatchEvent(new CustomEvent("dpg_displaypage", {
        detail: {
            pageId: parseInt(b),
            title: p,
            cooked: h,
            node: k[0],
            selTriggerId: c,
            curRevNum: d,
            curRevDate: l
        }
    }))
}

function R(a) {
    N(a, {
        a: "error",
        i: void 0,
        h: void 0,
        g: "nodiff",
        m: void 0,
        c: "<p>Please contact your administrator.</p>",
        title: "Oops! That page doesn't exist anymore",
        f: null
    })
}

function S(a, {
    a: b,
    i: e,
    h: f,
    c: d,
    title: l,
    f: h
}) {
    D("string" === typeof b);
    b === a.a && 1 !== a.l || h || a.left.scrollTo(0, 0);
    e && f && d && l ? b === a.a && d === a.c ? M(a, {
        f: h
    }) : (a.a = b, a.c = d, N(a, {
        a: b,
        i: e,
        h: f,
        g: "nodiff",
        m: void 0,
        c: d,
        title: l,
        f: h
    })) : b === a.a ? M(a, {
        f: h
    }) : P(`/t/${b}.json`).then(p => {
        a.a = b;
        if (a.L.find(c => c.id === p.category_id)) {
            let c = p.post_stream.posts[0];
            a.c = c.cooked;
            N(a, {
                a: b,
                i: c.id,
                h: c.version,
                g: "nodiff",
                m: void 0,
                c: a.c,
                title: p.fancy_title,
                f: h
            })
        } else a.c = "error", x(`Won't display static page ${b}, because category ${p.category_id} is not a static page`),
            R(a)
    }).catch(() => {
        a.c = "error";
        x(`Won't display static page ${b}, because it doesn't exist or is private`);
        R(a)
    })
}

function T(a, b, e, f) {
    a.H.animate ? (a = a.H.animate([{
        left: b
    }, {
        left: e
    }], {
        duration: 200
    }), f && (a.onfinish = f)) : f && f()
}

function fa(a, b) {
    T(a, "100%", 1035 <= window.innerWidth ? "50%" : "0%", b)
}

function U(a, b) {
    if (b !== a.l) {
        switch (a.l) {
            case null:
            case 1:
                $("html").attr("data-dpg-layout", b);
                break;
            case 0:
            case 2:
                3 === b ? fa(a, () => {
                    $("html").attr("data-dpg-layout", b)
                }) : $("html").attr("data-dpg-layout", b);
                break;
            case 3:
                $("html").attr("data-dpg-layout", b);
                0 !== b && 2 !== b || T(a, 1035 <= window.innerWidth ? "50%" : "0%", "100%");
                break;
            default:
                throw new C(void 0);
        }
        a.l = b
    }
}
class ha {
    constructor(a, b) {
        this.j = a;
        this.L = b;
        this.C = a.site.mobileView;
        this.left = document.getElementById("dpg-left");
        this.H = document.getElementById("dpg-ghost");
        this.c = this.a = this.l = null;
        this.F = (a = User.current()) && a.admin;
        this.N = L({
            method: "GET",
            path: "/tags.json"
        }).then(e => e.tags.reduce((f, d) => {
            d.parsed = K(d.id);
            return d.parsed ? [...f, d] : f
        }, []));
        this.F && (this.M = L({
            method: "GET",
            path: "/tag_groups.json"
        }).then(e => e.tag_groups.reduce((f, d) => {
            d = {
                id: d.id,
                name: d.name,
                J: d.tag_names
            };
            if (d.name && d.name.startsWith("dpg-")) {
                if (J.test(d.name.substring(4))) return d.J.sort(), [...f, d];
                A(`Invalid discpage tag group "${d.name}"`)
            }
            return f
        }, [])))
    }
}

function V() {
    $("html").toggleClass("dpg-wide", 1035 <= window.innerWidth)
}
window.addEventListener("resize", V);
V();
let P = a => new Promise((b, e) => {
    $.get(a, f => b(f)).fail(() => e(`get "${a}" failed`))
});

function ea(a, b) {
    return a.length === b.length && a.every((e, f) => e === b[f])
}

function O({
    o: a,
    title: b,
    id: e = "",
    O: f = "",
    disabled: d = !1
}) {
    return $(`    
    <button ${b?`title="${b}"`:""} ${e?`id="${e}"`:""} ${d?'disabled=""':""} class="btn-default btn no-text btn-icon ${f||""}" type="button">    
      <svg class="fa d-icon d-icon-${a} svg-icon svg-string" xmlns="http://www.w3.org/2000/svg">
        <use xlink:href="#${a}"></use>
      </svg>
    </button>
  `)
}

function Q(a) {
    a || setTimeout(() => {
        $("button.toggle-fullscreen").click();
        setTimeout(() => {
            $(".save-or-cancel").append('<span style="color:#646464">ctrl+enter = submit | esc = exit</span>')
        }, 500)
    }, 500)
}

function ia(a, b, e) {
    function f(c) {
        let k = a.b.left;
        k.scrollTop >= k.scrollHeight - k.clientHeight - 1 && c.preventDefault()
    }
    let d = a.lookup("controller:application"),
        l = "dpg",
        h = document.createElement("style");
    document.head.appendChild(h);
    b.forEach(c => {
        c = c.topic_url.split("/").pop();
        h.sheet.insertRule(`html.dpg .category-page .topic-list-item.category-page[data-topic-id="${c}"] { display: none; }`)
    });
    e && (l += " dpg-hide-balloon-cat", e.forEach(c => {
        let k = c.url;
        var g = c.slug;
        h.sheet.insertRule(`html.dpg.dpg-hide-balloon-cat .category-chooser .category-row[data-name="${c.name}"] { display: none; }`);
        h.sheet.insertRule(`html.dpg.dpg-tag .link-bottom-line a[href="${k}"] { display: none; }`);
        c = (c = c.parentCategory) && c.slug;
        g = `category${c?`-${c}`:""}-${g}`;
        h.sheet.insertRule(`html.dpg body.${g} button#create-topic { display: none; }`);
        h.sheet.insertRule(`html.dpg body.${g} .topic-list-bottom .footer-message { display: none; }`)
    }));
    d.siteSettings.discpage_hide_sugg_topics && (l += " dpg-disable-sugg");
    d.siteSettings.discpage_hide_tags && (l += " dpg-hide-tags");
    $("html").addClass(l);
    $("body").prepend('\n    <div id="dpg-ghost">\n      <div class="dpg-ghost-splitbar"></div>\n    </div>\n    <div id="dpg-container">\n      \x3c!-- <div id="dpg-ios-wrapper" tabindex="0"> --\x3e\n        <div id="dpg-left" tabindex="0">\n          \x3c!--\n          <div class="container">\n            <div class="loading-container visible ember-view">    \n              <div class="spinner "></div>\n            </div>      \n          </div>                \n          --\x3e\n        </div>\n        \x3c!-- </div> --\x3e\n      <div id="dpg-splitbar">\n        <div style="flex:1 0 0"></div>\n        <div id="dpg-splitbar-text">&gt;</div>\n        <div style="flex:1 0 0"></div>\n      </div>\n    </div>\n  ');
    $("#main-outlet").wrap('<div id="dpg-right"></div>');
    a.b = new ha(d, b);
    a.b.left.addEventListener("wheel", c => {
        0 > c.deltaY ? 0 === a.b.left.scrollTop && c.preventDefault() : 0 < c.deltaY && f(c)
    }, {
        passive: !1
    });
    a.b.left.addEventListener("keydown", c => {
        c.shiftKey || c.altKey || c.ctrlKey || c.metaKey || ("ArrowUp" !== c.code && "PageUp" !== c.code || 0 !== a.b.left.scrollTop || c.preventDefault(), "ArrowDown" !== c.code && "PageDown" !== c.code || f(c))
    });
    let p = a.lookup("router:main");
    $("#dpg-splitbar").click(function() {
        let c = !a.b.j.get("showRight");
        p.transitionTo({
            queryParams: {
                showRight: c
            }
        })
    });
    a.b.left.addEventListener("click", c => {
        2 !== a.b.l && 3 !== a.b.l || c.shiftKey || c.ctrlKey || window.getSelection().toString() || c.target.closest(".lightbox-wrapper") || c.target.closest(".dpg-buttons") || p.transitionTo(`/t/${a.b.a}`)
    });
    document.addEventListener("click", c => {
        c.target.closest(".dpg-on-off") && $("html").toggleClass("dpg")
    });
    (b = User.current()) && b.admin && $(document).keydown(function(c) {
        65 === c.keyCode && c.altKey && $("html").toggleClass("dpg")
    })
}

function ja({
    u: a,
    A: b,
    w: e,
    v: f,
    B: d
}) {
    if (b.startsWith("topic.")) {
        let l = a.lookup("route:topic").modelFor("topic");
        if (!f.includes(l.get("category_id"))) {
            H(() => l.hasOwnProperty("tags"), 15, 200).then(() => {
                W({
                    u: a,
                    A: b,
                    w: e,
                    v: f,
                    B: d
                })
            }, () => {
                U(a.b, 1)
            });
            return
        }
    }
    W({
        u: a,
        A: b,
        w: e,
        v: f,
        B: d
    })
}

function W({
    u: a,
    A: b,
    w: e,
    v: f,
    B: d
}) {
    let l = $("html");
    l.removeClass("dpg-page dpg-tag dpg-topic dpg-comment dpg-discuss");
    l.removeAttr("data-dpg-page-id");
    if (b.startsWith("topic.")) {
        let h = a.lookup("route:topic").currentModel;
        if (f.includes(h.get("category_id"))) {
            l.addClass("dpg-page");
            l.attr("data-dpg-page-id", h.get("id"));
            return
        }
        let p, c = (h.get("tags") || []).find(k => {
            p = K(k);
            return !!p
        });
        if (c) {
            let {
                a: k,
                s: g
            } = p;
            b = a.b.j.get("showRight") ? 3 : 2;
            S(a.b, {
                a: k,
                f: g
            });
            l.addClass("dpg-topic dpg-discuss");
            l.attr("data-dpg-page-id",
                k);
            e || X().then(() => {
                $("#dpg-back").length || $('#main-outlet > .ember-view[class*="category-"]').prepend(`
        <div id="dpg-back" class="list-controls" style="position:-webkit-sticky; position:sticky; top:70px; z-index:1000; text-align:right; margin-bottom:-10px">
          <div class="container">
            <a style="padding:5px; background-color:white" href="/tags/${c}">
              &#8630; Back to topic list
            </a>
          </div>
        </div>
      `)
            });
            U(a.b, b);
            return
        }
    }
    if ("tags.show" === b && (b = a.lookup("route:tags.show").currentModel, b = K(b.get("id")))) {
        l.addClass("dpg-tag dpg-discuss");
        l.attr("data-dpg-page-id", b.a);
        if (!e) {
            S(a.b, {
                a: b.a,
                f: b.s
            });
            if (d) {
                let h = a.lookup("controller:tags-show");
                1 === d.length ? (h.set("category", d[0]), h.set("canCreateTopicOnCategory", !0)) : ka(`/t/${b.a}.json`).then(p => {
                    let c = p.category_id,
                        k = a.lookup("controller:application").site.categories.find(g => g.id === c).parent_category_id;
                    p = k && d.find(g => g.parent_category_id ===
                        k || g.id === k) || d[0];
                    h.set("category", p);
                    h.set("canCreateTopicOnCategory", !0)
                })
            }
            X().then(() => {
                {
                    let h = $("footer.topic-list-bottom");
                    $("table.topic-list").length ? h.html("") : h.html('\n      <div style="margin-left:12px">\n        <p><i>No topic yet</i></p>\n      </div>\n    ')
                }
            })
        }
        e = a.b.j.get("showRight") ? 3 : 2;
        U(a.b, e);
        return
    }
    U(a.b, 1)
}
let X = () => new Promise(a => {
        Ember.run.schedule("afterRender", null, () => a(void 0))
    }),
    ka = a => new Promise((b, e) => {
        $.get(a, f => b(f)).fail(() => e(`get "${a}" failed`))
    }),
    Y = () => new Promise(a => {
        Ember.run.schedule("afterRender", null, () => a(void 0))
    });

function Z(a, b) {
    z(`Invalid Discourse setting "${a.replace(/_/g," ")}": ${b}`)
}
export function init(a, b) {
    let e = User.current(),
        f = e && e.admin;
    if (b.SiteSettings.discpage_enabled && (!b.SiteSettings.login_required || e))
        if (b.SiteSettings.tagging_enabled)
            if (b.SiteSettings.discpage_page_categories) {
                var d = b.SiteSettings.discpage_page_categories.split("|").map(g => parseInt(g)),
                    l = a.lookup("controller:application"),
                    h = !1,
                    p = d.reduce((g, u) => {
                        const t = l.site.categories.find(w => w.id === u);
                        t ? g.push(t) : f && (Z("discpage_page_categories", `category "${u}" not found. Please reset this setting and add your category(ies) again`),
                            h = !0);
                        return g
                    }, []);
                if (!h) {
                    b = l.siteSettings.discpage_balloon_category;
                    h = !1;
                    var c = b && b.split("|").reduce((g, u) => {
                        const t = parseInt(u);
                        (u = l.site.categories.find(w => w.id === t)) ? g.push(u): f && (Z("discpage_balloon_category", `category "${t}" not found. Please reset this setting and add your category(ies) again`), h = !0);
                        return g
                    }, []);
                    if (!h) {
                        Y().then(() => {
                            ia(a, p, c)
                        });
                        a.lookup("controller:application").reopen({
                            queryParams: {
                                showRight: "r"
                            },
                            showRight: !0
                        });
                        var k = "";
                        withPluginApi("0.8.30", g => {
                            f && g.decorateWidget("hamburger-menu:footerLinks",
                                () => ({
                                    href: void 0,
                                    rawLabel: "DiscPage On/Off",
                                    className: "dpg-on-off"
                                }));
                            g.decorateWidget("header:before", u => {
                                Y().then(() => {
                                    a.b.G = u;
                                    a.b.G.widget.model = {
                                        can_edit: !1
                                    }
                                })
                            });
                            g.decorateWidget("post:after", u => {
                                let t = u.attrs;
                                if (t.firstPost) {
                                    var w = $("#topic-title .category-name").map((y, B) => B.innerText).get();
                                    p.find(y => w.includes(y.name)) && Y().then(() => {
                                        S(a.b, {
                                            a: t.topicId.toString(),
                                            i: t.id,
                                            h: t.version,
                                            c: t.cooked,
                                            title: $(".fancy-title").text().trim()
                                        });
                                        U(a.b, 0)
                                    })
                                }
                            });
                            g.onAppEvent("page:changed",
                                ({
                                    ["currentRouteName"]: u,
                                    ["url"]: t
                                }) => {
                                    if (t !== k) {
                                        var w = t.split("?")[0] === k.split("?")[0];
                                        k = t;
                                        ja({
                                            u: a,
                                            A: u,
                                            w,
                                            v: d,
                                            B: c
                                        })
                                    }
                                })
                        });
                        TopicNavigationComponent.reopen({
                            _performCheckSize() {
                                this._super();
                                1005 >= $("#main-outlet").width() && this.info.setProperties({
                                    renderTimeline: !1
                                })
                            },
                            didInsertElement() {
                                this._super(...arguments);
                                this.observer = new MutationObserver(g => {
                                    g.forEach(u => {
                                        "class" === u.attributeName && u.target.classList.contains("dpg-topic") && this._checkSize()
                                    })
                                });
                                this.observer.observe(document.documentElement, {
                                    attributes: !0
                                })
                            },
                            willDestroyElement() {
                                this.observer.disconnect();
                                this._super(...arguments)
                            }
                        });
                        ApplicationRoute.reopen({
                            S: Ember.observer("topicTrackingState.messageCount", function() {})
                        })
                    }
                }
            } else Z("discpage_page_categories", "missing setting");
    else Z("tagging_enabled", "this must be set to true")
};
