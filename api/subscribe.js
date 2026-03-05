// ─────────────────────────────────────────────────────────────────────────────
// /api/subscribe.js  —  Vercel Serverless Function
// BMB Deutschland GmbH · Brevo · PDF-Anhang + Lead-Speicherung
// E-Mail-Template v5: Gill Sans · BMB-Logo · 1.FC Köln · dynamischer Betreff
// ─────────────────────────────────────────────────────────────────────────────

const PDF_B64    = require('./pdf_b64');
const LINKEDIN_QR = "iVBORw0KGgoAAAANSUhEUgAAAN4AAADeCAIAAADdBSngAAAE/ElEQVR4nO3d243ENABAUUB8UwG9UDu9UAENDAUEgbH8uBPO+Z7NZHevIjlx7B8/n88P0PPT7ROAvydNoqRJlDSJkiZR0iRKmkRJkyhpEiVNoqRJ1M8jH/rl1992n8c/+POP3//1M3Nn+Dzy8zj7vn3ON57z08gZumoSJU2ipEmUNImSJlFDI/SnkRHWnLsjx6dV5zP3Fxv59lVj9tr/1FWTKGkSJU2ipEmUNImaHKE/rXqKveq7Rsatq44zYtVIf2T0vWqsffJ/+uSqSZQ0iZImUdIkSppELRuh14yMZE9+Zu4MR6w6To2rJlHSJEqaREmTKGkS9doR+oi5ud+18fi+77rLVZMoaRIlTaKkSZQ0iVo2Qr87Brz79HnfDPank3/nu/9TV02ipEmUNImSJlHSJGpyhF5bz+3p5Bzyuc+MuDvr/i5XTaKkSZQ0iZImUdIk6sfP53P7HP6zk+ur73uufXePtj5XTaKkSZQ0iZImUdIkanI/9FXPiEeMrFW+ahx9csX1p1Xvs8+9q76Ktdx5OWkSJU2ipEmUNIkaGqHPjblOzr7uzypftUfbqr/qiJO/xZOrJlHSJEqaREmTKGkStXEt97tP3kfM7S1+co79vjsG+57Xr7pj4KpJlDSJkiZR0iRKmkQtm+X+dPIZ+r7nyKvuM/Sf8o84eUfFVZMoaRIlTaKkSZQ0ibr8DH3VT40c52nVu+F3V5xbZd8dA7PceRVpEiVNoqRJlDSJ2rjb2qrZ13fHtvvmtK96p3vkM9/4VN1VkyhpEiVNoqRJlDSJmtxt7e5OYSf3BN+3i/rcT53ce32O99B5OWkSJU2ipEmUNIlaNsv95A5o+0bN7xiPn3xe/2S3NV5OmkRJkyhpEiVNojY+Qz+5Ntqc/l2FuSPv+++cvIPhqkmUNImSJlHSJEqaRE2u5T73U/vehj45cpzzje+z310TwFWTKGkSJU2ipEmUNImanOV+cj72N848f7q7r9zJeyxP3kPnVaRJlDSJkiZR0iRq2Sz3fWPtfefzdHI9830j631HXsUsd76YNImSJlHSJEqaRC2b5X5yLbK5I8+N2e8+Ma+9vf60766LqyZR0iRKmkRJkyhpEjX0DL32zvLd1dJOHudp3xnuu6tgpTheRZpESZMoaRIlTaImR+i1+er7njXP2ff3mXPy7fUn76HzKtIkSppESZMoaRK1bD/0VSPruTnkd2do370/cHJ3eGu5gzSpkiZR0iRKmkQte4Z+cifxkzO0R47TX5Vun30zHFw1iZImUdIkSppESZOoybXc79o31h6xahe5Of33/b2HzstJkyhpEiVNoqRJ1LK13PeZmwm/b/R98u3su2vd3z2yqyZR0iRKmkRJkyhpEjX5HvrJleJGPrPqHep9b4LX9ijfN8feM3ReTppESZMoaRIlTaI2rhQ3ovbc9unuGa5aN2/f2H/Vb/HkqkmUNImSJlHSJEqaRC0bob/VyffHT+7PfnJNvCfP0Pli0iRKmkRJkyhpEvWSEfq+FcVPrhu/6m7Aqvn8+56Pj3DVJEqaREmTKGkSJU2ilo3Q943URr5r3yz3Eau+/eQedqu+fe58RrhqEiVNoqRJlDSJkiZRk/uhn3Ty+fjIt88d+eT77LUd272HzqtIkyhpEiVNoqRJ1Ffuh87/gasmUdIkSppESZMoaRIlTaKkSZQ0iZImUdIkSppE/QVcFQV4JQlm1gAAAABJRU5ErkJggg==";
const BMB_LOGO    = "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";
const KOELN_LOGO  = "iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAIAAAD/gAIDAAABCGlDQ1BJQ0MgUHJvZmlsZQAAeJxjYGA8wQAELAYMDLl5JUVB7k4KEZFRCuwPGBiBEAwSk4sLGHADoKpv1yBqL+viUYcLcKakFicD6Q9ArFIEtBxopAiQLZIOYWuA2EkQtg2IXV5SUAJkB4DYRSFBzkB2CpCtkY7ETkJiJxcUgdT3ANk2uTmlyQh3M/Ck5oUGA2kOIJZhKGYIYnBncAL5H6IkfxEDg8VXBgbmCQixpJkMDNtbGRgkbiHEVBYwMPC3MDBsO48QQ4RJQWJRIliIBYiZ0tIYGD4tZ2DgjWRgEL7AwMAVDQsIHG5TALvNnSEfCNMZchhSgSKeDHkMyQx6QJYRgwGDIYMZAKbWPz9HbOBQAAAqUElEQVR42u1daXgUZbY+X229dyfdne5OujsLCWHXQFiEIKvsyCIExAUYERUVYVBGFFAEBQQFAUVBheBcIzuCgwoKguz7GrYQQvZ97fRaVd+5P0pyuXpHwSEzzHW+p3/kqa7uVL31nv2crwkiwn/WrS3mPxD8B6w/BliISCm9O5UD+RdelvKvCSH1GLEsezcz618DlizLDMP8Eiafz1dYmM/zfESETavV/dHBQkQFIwAoLS31eGrj4xMAID8/f8WKFaFQKCzM9MUX6X369F248B1Zlu8qrjH/EqTWrl07a9ZrnTrdt2rVp5TS2bNnP/fcc5Ik/eUvfyEEUlI6T548mVLKMMwflFmKuMmyPGvWay1btjp8+BDP8+++u6hr1y52u33Nms80Gm3Xrvc3apSwcuVKnudv5uAfjlmKYpox41W3292zZ4/CwsIXXnjhkUdGOZ2uV1+dzvP86NGPtmvXbvXq1RzHUUrvNqR+euD/hCVJEiKmp6cvWfJeQUHeQw8N+eGHXU2aNF6+/H3lhCFDBk+e/IJypuI63IXrnyGGivbJzLwyevRjhw4dTUtbderUqeLiYo1GM2/efIfD8frrr128eHnDhg03W8m7cf0THogsy15v3UsvTfnkk5VFRYX9+/eNiXEvWDBfeXf//h/j4+Oqq6sUjYZ38YKGA0iSJFmWRVFExJUrV44bNw4RP//8vwCgSZPGe/b8IElSeXl5p073bd68qV5U7+bFNZThuGH1KaWhUOjIkSMDBgwIBoNffPFFSkrH9PT06OhYRHz33XcJIUOHPiRJ0l3uvjeINaSUAsDmzZtnzpx59OhRjuN27NjRqFGjoUOHHj58ePv27X369LFYIkKhECHkwoULTz/9NCJyHHf3qqobi2sIJQgAgUAgOjo6PT396tXMc+fO1tV5KaXnzp0JCwuLinKJoqjT6b7/fuflyxdHjVpPCLl6NdPlcqvV6rsarYbQVoh49OjRzz77DBEHDRrYvn1yWVlpZWVly5bNV6xYgYiiKMqy/MQTf0pNfejAgf3du3fp3LnzW2/Nrf/4H0XBK15SaWnp0KFDEXHPnt0pKR0R8W9/+xsAZGVlSZKkaP0nnhjrckUlJiZs3LghLy937Ngxfr/vblbwd15nEUIopREREe3bt3/55ZedTuepU6eeeGKs3W7v2rXbd999pyjy7dv/tmnTJqvV+v33u9xu95o1aWFhJp/PWy/If5TkH8MwsixPmzYtFAqNGvXIBx8sf/DBQTExMbt37+revTsAVFdX//jj3pkzZx48eGjDhvU9enRv3bp1MBg0m613dU2gQeObv/zl5ZUrV/5MQuvq6updqgsXMgBg69YtaWmr9Hrt0qXv3ThR/kOIYb0wAkBW1lW73S7LcigUUg76fL7t27d/8MEH169fV5TXjh3fqtWqKVOmPPjgg9OmTRsz5vFAIHB3CiPTcIQFgKSkpOPHj7Msy/P8Z599dvTo0fLy8r1791osFp7nCYF77rm3d+8+06a92q1bt27duun1+s2bNz/22KOU0rswE9+wKZqmTZv6/X6FU7t3787NzT158sS6dWs9nlqn08myXHZ2dnl5+fDhqZs2bbl8ObN585Znzpytqqp68cUXWZZV/Ns/is5asWLFvHnzFCU0efLkwsJCRAyFQohYXV01aNDA++9P8fsDColGjx69c+dORDx16oRGo/7mm28Vj+z/fyCt3OT06dPXrVuHiGfPnt24cUNNTXVeXh4iBoPBgQMHxMbGXL58SXFEKaWFhYUKjojYtm2bZs2alpeX31V4NRRYClnGjRt34cIFRLx6NTMQ8E+ZMjktLQ0R58+fDwD79v34y2RDMBg8depUkyaJANCjR7e6ujrlnLshKcg0kGgTQsrLy2VZbty4MaU0Pj6BELJ3794mTZoUFBQsXbo0MtL+2muvZ2RkMAyj6CZRFCVJGjNmdPv2bZ3OqDVr0rRabc+ePfbt28eyLMuyhBAlGPp/pbMUsmzduvXVV1+tpwOltLS0BBGfe26C0WhISGjEsiQtbTWlVJIkSRIVt8tqNbdpk3Ts2FHlU+np6W638+GHR3799dceT93N4ef/EzFUwJo1a9b69esRsaCg4NKlSwpqx48fs9mskZH2mBi3xRK+f/8+RStRKi9ZsjguLuaRRx5WlJQSbCPi0aOHLZZwo9HQrl3bN96YlZ+f/6/KFDYIWMpNTpw4MSMjY+fOnYMHD7548SKlNBAIPPBAT5vN0qFDu+hol9VqXrXqE6/XK8tydXVlZKQ9Pj7u/PmziFQUQ5RSv99/5sxpRExLWxUeboqKcuj12oSEhA0bNvxL8GpAZj377LNHjx6trfUoXEDEKVMm8zzbq1fPpUuXqtVCfHycVqt++eWpiHj9+vXmzZsfP35c+bhCrg0b1rVo0VyW5YKCgtjYGJcrKi4uxuGwmUyGTZv+BZnoBnRKU1JSFi5cyPOc0+nMz8+bMOHp1atX6/V6p9PZo0ePpKQkn89rtVrXrPlsx44dNputV69eycnJSnmRZVmv17tq1apgMCSKokaj0WjUik1UqVQ6nW7SpBcyMi78sx3XhitYIOKMGTNSUlL69evXvHkzk8kQHx9nMGgVKp05czoy0h4bGx0WZuzbt4/P56utrVX8A4VZs2a9rlYL8fGNiouLSkpKYmOjo6IcbrfT5Ypq1CjWYgnv1euBYDDwz3QpGrAUptzD5cuX778/xWw2xcS4o6NdBoN2xYqPlLcWLHhbp1MnJDQKCzOOHDlScU1FUaSULly4ICzMkJDQyGjUb9y4ISsrKyLCoiDlckUZjXq326nXa995Z8E/UxgbUAwJIaFQKDExcebM14LBkNlsCQ8PZ1m2VatWyglPPjkuJiY2EAgYjcbdu3ddunSp3kc7e/YcIoiiVFtbt379+vz8fK/XW1/+GTt2rM1m02g0ixYtysjIYFlWluV/+0Ba6Vqw2WyU0jZtWsfFxTmd7qSk1oQQAHzzzTdLS0sDgQDHcYGA/8iRw4QQnucvX7508uQJnud1Ot2YMaMdjsjGjRu3bt3G6/VSSg0Gw5Ily6KiojQajSiKf/nLS5TK9VWlf+OKtKK5zp8/z3HM1q1bUlOHvfnmm4hYXV09bNjQ8ePH7d27d9SokUaj3uWKatWqRX5+fl1d3ZNPPqHTaRISGh07dqz+S/Ly8po2TYyKctjttv37D+zatWv16k8Uyzh79qybrfC/pc6qv/qdO3d27twpFAoePLhf0WKDBg36+OMVyjkeT+0DD/SwWMK1Ws28efOWL1+uUvFWqzk9/fP6FIXyPY888rDJZHC5nAcOHEDENWtWm0yGhIRGVqv5hRcm1tbWNjReDQuWksO7du1aVlaWcuSrr74aNWrU2bNnb5wgy7JcUlLSrVsXrVZ9zz0tW7RoFhZmHDCgn6Ls65klSaEuXTobDLr+/fsp8XZtbe24ceMIAbs9QhC4Tp3uO3HieH0O49+v1+HmI4WFhS+//PK0aa8oYrhly+YjRw55PB7l3bKystTU4YSQVq1ajhiRunz5B/VYU4qBQOCpp8Y5HDZBYOfPn1vPuCVLlowcOWLIkMHt27czmQwqFff+++83XPzYIEXWmy80Ly9v//59S5cumTx50u7du5X8THx8fFiY0WwO69Gj286dO73eOkSUZbpx48Y9e/aUlpaWl5dTSj2eWiVIevTRRwwGXViY8dFHR1VVVSrcuZk+lZUVu3fvmjv3zchIx6hRowIBf0OIJDSEklKU+ry5c59+avyEZ55OTm69Yf06RCzMy+3ZrYteq3ZFOWJj3NHRrkiHTRC46dNf8fl89Zk/ZZWXl44aNZJSumTJezzPWizmyZMn3ezB3eCvKIriuHFPtG+f/OGHH1y4cH7kyNTk5NY5OTl3HC+4s5xCxPMZGePGjXv0kUfS09OLK8rfeG3Glo3rL17NXL1xXWRiPBdujGgUY412OtxRbpczNtrVKCY6zGSYPn06Ivp8vvo834UL5yIj7QUF+X369LbbIwYPflBh0820VY6EQqGkpCSeZ0wmfcuWzbOyMufOfcvlcp06derO4gV3llPr163t3bPHzm++8QYChw4emP7MM9rICGezpvHhpvGCfrrB/JLVMcZi62uz3xMZ5XA5wt2RETExkZGOJo0bbVi7TgFA0es//LCbZZmPP17xwQfL9u37Uel2+6XmVkRy9+7dHTveFxZmio2Nzcm5johTp04NDw9T7K+SLPv1x3wrNuHOtEnKoRArCAdOnOjZ8/4OyR3tiQmhw0dTTl/SAtRYrGo52E1mEmUQgQJlWUIzWTmHclqCBwV6hCeXVaqSUNCmEea+Pufhx0cr4fHHH3/84ot/ttttTz45ftKkyVqtDv9O/7LShpmXl3f+/HmtVtu1a1dJkhiG6dq1y6VLl7Zt+6pjx46/0lJ/G932/4BfoDwUiVKZIlJf4M0RIxMMhiSbbbDacJQzbTSa3zVYRWBKgMkHJhOYq8BeBrYYyFrO+LrJGuDDyjX2XLXtG03ERKujkcOhiQjv0bNHQW4eIg4dOsRsDouJcXMcM2bM478uUD+TTYWb27Z9qdVq4uPjz5w58/fso0Ko/fv3KzL76zb0d/dnIQWKEmU5HgGq0tM9cxc/cvnqULWeq/CZ5IAWNJ8LfKktorrnGCkmVmu3GAUViHJdRZUmN//awb1Hr1wsRwj4yzhQtVVr23lwFEv+qtP89ejhB0eNbNsk8dDBA1qtFgDMZnN2drYkSUrw9H9OEjAMo9w5IYRhGCWvn5CQ4HDYa2qqxox5/Ouvv4mMjLqZm4pI+f2+ffv2vffe4rlz5zccs6gsBimiL/NazoChWcDnMcZcMFwHct3VJO+5KYFjJ1IHDe7QuSMiyohSnU+s8Uheb0gWEfG5KX9uEh9bffxE+ay515q1vQRCNmhK1NZylfVLk719eBgbpo++kWOIjnbZ7ba+ffvm5eXfSmVMIeDixe8mJibExLjj4qLNZtOQIYOVgki9blK+Z9mypVqtOirKcejQod9kFty+8FFKKZVERKxYvyXT6s4FVa7amgV8TmLr0pVpIUlExOrc3NZtWsVEOg926FrgTLxmcmXrIrMNUdn2uKzkLl0bJ0Y4rKf3/qhAWf3l33I69bgKfBZjqFBFZKptEyIizW6H2+V0u6JcrqiYGLdWq01NHV5SUvybt6SA9cwzT3EcExPjjoy0R0RYdDqtUu5VMFLclNOnT7ndzuhot8Nh27Zt250HS/FsKGLxgnevgjqPt+aB4aououTN+YpGqdy4raTnwG/1thiHPcLl/JzRVoDuOhuWx5pyWFMJ6A+DrrndZoyOXKYNL03uXPLBSkmmiFi55r+uOhOuAV+kjihSWd802W3OKKc7SsErLi46LMyYnNz6hx9++PW7UuB46605brczI+Pc2bNnn356fESEJTLSfuzYEUQURQkRi4uL2rdvq9WqIyPtBoN+1apVv+ln3D6zRIkiFk6flQVcoc6aBXxWckff6QxErP1qR07rlEzgKoD7RGe2RjvNbtdMS2SFKiJbZclVWa6rLBWC+XNTpMMVFRbtnGS2VYA6E8i1mOZlK1YgYqisImfQyKvA5KkslYJ1kdFuc0a6XFFuV5TTFRUXF6PXa3v2fMDn8/2KsVdwzMg437x50/LyUkSsrq5s3Die59muXe8vKCiQZXnHjh2NG8ezLElNHbZw4dtt2iQp+Z9fdyBuHSxKKZVFERGL571zBbgCgz0LuJxhj8ohUarz5jw67hoI10GVrbFWqh2TwyOtrkir25lqdRQJ5hzenCuYs1SWCiH8DZMt3O10uJx9bI5cTUSexpoL+mvAZ3fr68+6joiFL8/KAiFHHVbF2+abIszuyGhXlKK/GjWK1et1s2e/Uc8CxU1VktE3e/aI+NFHH+3du0eW5VAoePr0qalTX9Lrta1bJ91/f+euXbssWLDg/PnztbU1Awb0S0tbdSvuK9y6qlLYW7Fu01VQ5esd2cDlP/EMRfSdy8humpwDTI7WnKu25QtheSpLP5vNEh3lcEe2tdsvC9ZC3pwvhOUKYSW8eUSE3eqOinI7W0RGnlRbi3hzrioiV2vPBTbT6qz96mtELJm/OBNUOWpLBR8xyWwPc7tiXJEuV5TLHeV2Ox0O29GjR5Tcw68ntRFRkn4S2LS01SaTITrapVLx77yz0OfzbtmyOS4u9vHHH71FR/9WM6UoI8Oy/ouXK59+Xq3WiXUV7IhHnZ9+6D10pKhbP3LpPNFGsCIEUPITrhowm2MECgJCMcfkcUAJVDJsENgalr3GMiwgj1DGklwWkDBepGxIIhqrprK2fPCIis/SbS9PNrz+uhio8XI4xRu6LyB6gOFZBhBYlvV4PAcPHlQy148++ui5c+fKy8vmzp1bWloKN00TK7lTlmWKiormzJkzc+ZMvV5PCAkPD3/ttZl2u23YsIf69u2zevUaSuVbmW28RQ8eUaYAkNN7KLP7O2BYmtzWvf+7wMXM4p69hcpqotFRSRYAiwhZpybtKDPJwDEMEIBaAu/USKUgNZH407zUXmYmGnmRITxAFZHeqKUSYqwM3UJSHWEIyxJZ9FMxYuP68MH9Cx57Kvj5ar0m7AohT4Tzpd46g9FAEJTkstPpHDr0oQ8/XO7x1Fks5lOnzmzdunXQoEH1HjmlCIALFsxfuHBhIBAwm80Mw3i93t69+9xzTxIi7dWrV9u2beF/z9f+w0MDMiUsW/XpGti9nVFbRIFE/vVT9PqLhz/CV1QQrRElCQAAQWZhm5Y/iAQYRCAAqEVYrePKkZvjFXerhB0cIAOEgAxUg8J6rVwK0iwvEsICyxCCDMOpQ76qIUP5H39wfLQ458Rx/+WriSwua9Zuqd1w9vtdRFAr5Dp16tTJkydNJpMkiWVlZWFhhqysrJv7KwkBSpHn+QEDBp49e6akpEStVouiaDKZpk17uT5UIoTc4nDHLYBFERhGrKmumbOQ44zBQKVx3gfqJvF5qaP5q+cZrQ2lIAAgAAPgJyRAyGUe1JRQAATCEMzikEWoYMDPkhyWaBEZBImACmiuQIJEjXUhCIkyVFGgEhsmJHXQ3HcvRcrqddYli0r7DwLCtTh9fvu5oyOmTvl640ZDeDiVZaPRqOh1lmU5jpMkWlxcVN/OqvzBssyLL04FgOPHjw0ZMoRSynFcfn6+oqFYlr2tyeLfBovKMsNz1WvW0pwryKq4Vm2tLzxVu2mruHEtp7UoSNVXijyEiABqJBQoAAEAQCIAiADFhIQIqoAQQgjDCMCKkih5gmWSP8eLssOl6j5U16+3qlN7PtrN8TwAoCwbe3fzDB8eWJeO5d6SBe+9s2jxU48//sacOQBw+fJlrVbLcZxiDVmWKSsrUVC6Wc9IkkQIadGiZURERGlpMSGEUuQ4Dm9/rJj57WCIY+RAwL8yTWBUQVk0vTYNqFz16iye4RiZUPI/BSgCWEcwSAgCxZuuGAGAYIHAU44lhAmGQlWVlRWV5QzLtkpOmvHClEH7dpvOHwub/jJRCYELlxmel0URlMlfxPBpU4haLzAaz1+/iCbcA737bt605dtvdzz77LMFBQVVVVWiKCrhYVlZOQAwDPlZ2MiybHFxSVVVNctylFKVSmiQQSeUKcOxtfsOihfOCcBwiS30Dz1Y9dcv6JXzrCYcZZG5ATcCMEBqCJEYJPjTI1PCWgAAMXTJ5yvy+Imgjo2NSe6c0rljp/vatW+ckEAYNrDvYNFDI+ih40SsIp17mx7sxzAMMIxCLk1SS1XvXvK2L/nykvKNm8PH/ynCGgEMmTFjZlJS68LCopUrPyotLRUEoaysLBDwq9WaXwbM586dqa6utFgslFK9Xn/rSv02wCIABMC35WseRQlAN2o4x7B1H6zmCIv/x7lQwxAghCVEGbIIBoOBQAAoDTeb3V3aDezTM6VH91aNEkw1dRBpVyAueO0t35xZauBZ4EUAjdPFACBQAFa5JQZR+/jwym1beUIDW3eQZ56UJZkQwnH8kCFDAcBsDpswYYLRaCwsLCwrK3e73b8EKyMjQ5FHSml4uPn39dlzvy6EhGOlYCj4434OOJEXjA+nBi5fkU4e43kD/FQxJwCIBIAQIEwdx8qy5PEFAqKo0WhjY2Patm3brVfvDl26ONUa7kqW75sfar6eUXT+fNTu7fpWzUvnvhuYM1OnCgsFqer+TjIvy+7Im/UOYVgkRNete02kmxQVSMePi0XFQqSDUIqASpKvdes2yriix+NZtmzpnDlv8jx/cxcBIrZo0YLjOAUjq9XSABVpWUbEuoxL1zT2PFBnNWmNiGULFmUDk6u15wrmXJUlV2PN01rzBPM10JcBM44RbIlxDw0e/M7ChYcPH66rrUVEzL5eMvap7LiWmaDJAsgGyOLDZJ/fd/JMJmfIU1mz+LDyDz9WPGix1iNRivTnl5E/aGQOqLJBX/3t90qIWh/ZBIPBsWPHmM1hsbHRJpPh0qWLv/TI6+rq2rVrGxXlMBh0H3304e9rgmZ+HUgAoBmXGL9HBqpNaoUA4p5DhBEYhiEsQ0QJ/DWSryIYCkGTBPLMi898+7eju/du+vLLF196qUOHDjqdTpLl4rT02rSVbF6BhlMxehvbqad2+sugUVe9tVCQgjTkUT0y0vLMkxAMygBo0DOUIMGb0owIAFz7NgCIEAqdPg8ACFj/sAVBGDdunCiKhBCe5z788MN6IJS+3urqap1ON2zYcK/Xy3Gc1Rpxs4dxZ6zhT7nErEwAiQAy97QkAKHLlxgqBuvKQv5a0WwmfQYYl34Ydel0dMZx7aw/t5DZGEckRZRFiVJKZcqxLPHVcZyGMJQ6oyy7vjEtfDNs/Bi5qiawZx/DGyWU2BZNAYBVqWq+2eXd8yNhAWX8H0uKFBA0zZrJwHEANPPKzdet5EhjY+Pi4uJCoZBeb1ix4qNPP/1UcSmU1NWrr74aCPiHDXvIaDQSQiyW3ymGzG8OK9GCYgBEIOqEeLHWGyytoC1aa599wbJpY9TZ/VHfbtEN7uf//vu8/kNLnE1zn5ssIWUAWI5lGEax4rSolJFESggNhGpeeqUkpZP/u+9DtbVQVQ0M8Jw6sHRl0dy3i596rnzIwxxDlCgMEFGWQRIpywIBxumgvIoAIxWXIADccCYVne1yud5+e2FFRQUi2O326dNfWbJkCcdxynxxYmLiK6+8kpDQOD4+QRTFsDDT72PWbzulWFlDAGTgiMkAPBe5a5s26V6W/+mDdRcuF7TprA6WE9CxEOKaxDOcQGWJsBwBAEIQAEsqEAjDqpmSQqnkKgGej09gdRrKCQSpKBj5wiJx+msEZE4wcdHRKMtAUHHAAVjZ6wGWZ81mohJQ9GNtHf7vW1XIlZKSMmLEiO3bt+v1eo1GM2fOnJSUlLZt24qiOHHixL59+0yc+JzP51WpVCqVqqH6s4gUIoAADCEMr1EZ2iUzPAeSTEMhQITiIi5YzqptnEEvEcqaLYxiyRCBUmAYirJYWcEQFYpBOT5eM/ttx4+7NW3bqKwW1ZABwVAF66uWaEAGEIHwPbqqYmMIywLLBQuLqjd9Vfz8S7lJ7eq+2cXbLCxhAVAO+AEACbmhtX4CzmAwrFnz1+7de9bWelQqFccx48c/mZ+fz/M8wzDvvPPuqlWr8vLyBEH43Z1ct8AsngMgCIiyBAAoioTjgGOJDECI5A1wD/THy1ehuBIRiM0GACBRouKAEEAEn59WVRGWQbGWH5Fqn/kXRRNRSiNWLKqItAX37NVotHyHdvzwwZp77/UdPunbsye4+0fpxBlaWcQCchBiUEZEGVBh60+eBYGf+QeU0s8/T3/44ZHff7/Tbrfl5FwfNerhTZs222y2e++99403Zs+ZM1ur1dYPH9x5ZrFaLQWGgIy1dQBACPPT5bIsIBj7PhD11SZJUDOSRIAQRwQgEpUg1/mkqhogRK7xEk8dK6gpw7IWLRVFyeuVZYllGHVYuPO9txudPuxfl1bVp4e0cVtR+y6lnbp7X5kqf/e1UFUtaEycLlxmVIw5TPZ4IRgiAIxWizcs9c80LCEgCPzs2bMjI6Nqaz3h4eHnzp17+OGHKyoqAOD55yfed1+HsrLyjIzzhBBEekfBUlwHuw0ACEih4pKbbbZyAsNztLQcK8uRZwmAyhIBhJS/tyL33vY597bzXbgiBXxyWXHIVxqiIT7SzfA8p9NxLOf1eg8dOrhg/vxhQwZ1fqDn2v6DyJIF8qWLPM9zGiujMUkqBqmEYghQzbhctKAAQkEAZCPM7N9pimQYFhFbtmy5d+/exo0b19TURERYT548/thjj3i9XrVaPXfu2+HhYYsXL7p2LYvj+NuVR+7XW2gBgI+L8wHhgIhXsuoP3hQjE6m6lnqDhDASIXzj6Jqvv6v+8zMq0PjBLwU9xMuSls3tg4Zoe/eg7dpcvZZ1/MiRvT/uPXHiZG5urs/rFVjGwzIBs5n4kAUJKYAs3RA0QiWJt1hV0e6a/QdZCFFALjYO/i9m1fNLkiSHI3Lx4sUPPvigx+PR6w0HDhwYPfrxdevWJycnT5kyZcaMGaNHP75hwyaHw3FbESLzm2CpmzRGjmeAlc5mICK5OQGEAABMRSWRJcJxFFmIsPlPnJYARIM+culHxtbJhnZJpl3bDw7uNe/ssYEjhvXp1evpZ55OT0/PzLwSCgXDzeEWq/XepCQPx1IpBD971AwBKkLzBEbgA4dPACACo27e5GdZmF92/UqS1K5dh5EjR9rt9sTExkajobi4ePr0GYowdu3a9cCBQ8uXL69PPd8xZgnNGnM2GxQWyxmXQoUFKqdLMXOKSBKAYHEhyDVBbw3qoliT0TFzqqNLR6/Dmq/VHly96utvv7menS36/VevXhU0GqRU8QyjoqKaN2++bdu2FWvWxCe3fqNVO4SfP2JCGAkC2ge6A0Dw4CEWGFFlUrduBTf5WX9vrwREfPbZ5wsLi1u2bL5v374jR44tWrT4449Xjh//1NSpUw8ePJSbe/12va3fYhalnNlM2raTQZarSv179gHiT6oREWQZZUmioB3xsHHjlkYZR+o4fuf3u14/dnDo1Bf7pNw38YWJzZo0GdCv36QpU1Rarc1m69O3b1RUZCAQWL06bdWqtLZt2zVq1Ki2uqYk4JVZ7ufSJcnIGQwjhwcyr9JLVxhgmMZxfLOm8Fuyo4DVpEmT6Gi3RqNJSkqqra2dN2/el19+mZ2d3bdv/7i4WJ/Pf4etIVJKAHT9H6AAAmDd2i1ICAXyU/1EEAjLmYY9qJ8zS1XrXzRzZqde3R9/OHXRrFlHfvjR6wuZw008L9R66r755tvq6urHHnts7dr1NpuD4zglT/KnP/2JF1RVlVU1siwySOojHABgGRqq4zt11CYm1KSlM6JHAln9wP2coEJZht9ihOIcdOnSxWazdezYMTs7WxCECROeXbp0iSiGPB6PIPB32s9iGQTQD+xTY7Yx1Z7g7j3+8+c1LVqgKIplFf6Dh/y7fgweOCxeOK+T6w6phGytJowQk8lkdzgsVmt+Xn6bNskDBgwQRVGSRJPJhIhlZeXh4eEGg8Hj8fTp00+n1Rw8daoWMEiIGol8AzCOQhDAOvXP1B/wfbaOIxqJofoRI35yX25h1xJCSHJy8rp1a0VRrKqqQsSBAwfu2PHNpUsXEhMTla0m7iSzCGFAllROl3pwf5H6eJ+nauEyIKT0089yE1tVpj7q/2gpc+6sihVAGxU0hHfq0G748OHNW7TYt+/AfR06vvfeewMGDCgoKOB5PjU1NTw8nBBy/fp1QRC0Wu2WLVvq6jy8IFSWltUSDBBgb/glLMuKQQ/p0s0wsE/lx2mQfwUB2U4p2g5tgSKwtxB4EAIAERE2QRDUatXFi5eUI6mpqQcPHmrevHlNTU0DhDtAAMA0aQIV1ETQSF+s950+ax7Sn9EbOV4QdBGo1hIgoixWiIFPV3zy/PMvTJjwXE1NdWbmpd69+7z11px+/fpQSjlOsFgi/H5/ampq9+49CCFHjx7evv0rAMjPy5EI8TKEACAQIASoJPMq2+K5YnVN7fxFHK+TUDRMmsAwBG7ZmUQEJd2uUqmPHDmsHGzfvoPPF2jTpm1lZSUi3lZ15xZOZVmQqe7ee9SjRsohL9BQ+bNTBEekZdXykBgEWQJEBtCLMup0PMdxHD9gwMDXXnutVatWlNL169dHREQwDHP+/HmNRqPRaJYtW9ahw30+n6+kpOT9998fOTJ1/dp1gimshkoMAAAyLBsKVhtnz9S2aVM2dQZXlIuyJHTqahryIFIKt7zbHSEgy3JdnSc5ObmwsLCqqgoA1GqNwWCorq6qqKhQPPtbj3tuCVckgIjhb0wXLXaOU9ND+4pff9PUv49h9uuBQCVheYYQL0rEYFQJqibNmgoCX15ertPpGYZZtuz9devWl5eXbdu21e12ZWdfW7169aefftK16/2HDx8uKyv77rvvJDEkMsRDCABhOD7kK1WNHGOd9lLVhs2BTz5hNYYgw5gWvM6wLNxyPKdAUFFR4fcHhw8fzvO8UoK9sZVJM5/Pl5l55bYmpG4JLMIwVJY1MdHh8+YEg9WCzuSfM79mw1bbzGma51+UfMUcw3mQ8Hp9mNGolAZeffWVY8eOAUCXLl0JYcaPH19YWPDUU+O7d+82adLEU6dO5ubmAoAgCAaDkSFEIughjMDxIV8p32eoI/1T/+lzleOfU6v1IX+lYfKfDSmdUJYJe6tSo0Bw+PARhyOSEFat1igaPRQKlZaWpqSkWCyWQ4cO/P1Y4HeX7wFYlpUk0TJ+jH/PvmB6mkpjKRv7J2LaHLVsYZFOE3p7QQ2AKsykFoSvtm3z9+rVrl0Hj8czcGD/Ro3id+/eVVRUpNPpzp49q1KpzGbzz1L9DACwnJcRA/5KfvhjzvVpgazrhUOGcz6vJEqkU/eI2a+CTMnt6BdlE4jPP/98zpw5gUCwadOmTZo0AYCTJ08igslkAoALFy7+PH67I2ABIRzLAEX7ykWFmVnysYMqlalseKr8X59Fzp8daNKs6IUJhGGrKivPnT+7/evtWq0mMzOzqqpq374ftVqdXq+nlGq1WqXE8DMbzzOMt85zXZQ1M2bZ5sz0n71QMHSYKq+AABtyu5zpnzIaFd7ObstKb8j8+fNcLmdiYuKiRe+OHTtWySavWvXp+PHji4uLQqHQ5Ml/vj0n/ja7bmVEDObnZzdLvg6aPLX1KqsvXvw+Il7LuvrEn0bHuF1Go85ms9rtEW63MyYmOibGXT+ue/PLHe2MiXHHRLutVrNBr+3S+b5D+/chYuXmv12zOPNZUx6ry7LE1p04RRHl25mSUDqzfD5fTIx70qTnv/gifcKEp5XjFy9euOeeFrW1NWPHjn7ggR43t3E1yISFLEoUMZCTe711hxwQ8rX2a8DmDX1EKi5CxK++2T7kwQEOm9Vo1Fut5iinIzraFRPjjo2NVl4KfC5XlC3CajDowkyGzh3vW522SkTEkFgw+cVMostTWbNBfdWZ6Dt+EhFpSESUbwssSmldXd2AAf2MRn1S0j2nT59UKmPLly+3WMK7dr2fEFi2bEl9x3wDjqNQSULEUHlZ7sBhWUDyNfbroM60uovnL8SQhIjHzp19/fUZPbreH+N2hYcZ9TqN8tLpNHqdJsyod0bZO7RPnvjCczv37FY4U5H2eVZCqxwQ8jUR14HLbpviu3IFEakU+t2z7D6fLzMzU6nxKKAsWbIEAFiW9OjRraqq6jebSO/MOArKEmE5ilg2Z4H3rblsSOR5TUCso654/ZhU+9gxJKERAORXV2Vdupx7PbuqosLv8wuCEGYOd7rdjZo2iXFE8QBQWl71X+uqVqVBxlmB1RM5GABZ88zTtoVvsXodShLD3YFtZ+tHDTweT1raao7jRo4caTZbbrfd4ffP7iCVkRCGMHWHjle8OlPcs0sDGsoApYGQYGCT7tF1vd9w/33aFs3BYQftja1tQxKUlIqXM2sOHanbs1c6eoKtq+ZAIAQk9NN725nfnBk2sB8CUpkShiUECfzObYR/osPf6VX7HY0h/+igE5UkhuNkCrXrNnqWvi8ePq4CGYABoBLIAKzIC2A08WqdLHBEpuD1y3V1bNBLIMQBD8AChCQgtNU9Yc+ON419nFOrQabAEGiArZaVQWNEUDaYuu3NF/5RsBAppQxhGIbISP3f765duzW0ay/k5BAIEAACDAAqZdobQQgiUASWAoDDzXftqB85TN+/D6dSUaBERnK3bt/9j4KFSvUYAKlMWFbJ90q1Nb4TZ4JHTkpnz4ayc0lFNQb8RJSQJaBRkXALF+NmWzZTdWirbdtauNHTQmWZ3M0/M3Dnfx1FpgB4c6wrAxB/QA4GQZKBYYhaYLRa5pcfYRi467c4b5jfsEBESoECEiQs+z9l0XrrJFNEwhAkDAFyt++Z38Bg/e/yD/wsV3CjTw0BCPw7rX/lD6v9263//L7hf8BqmPXfui/mmmRqVfsAAAAASUVORK5CYII=";
const FONT        = "'Gill Sans MT', 'Gill Sans', Calibri, Arial, sans-serif";

// ── Betreff mit aktuellem Datum ──────────────────────────────────────────────
function buildSubject() {
  const now = new Date();
  const dd  = String(now.getDate()).padStart(2,'0');
  const mm  = String(now.getMonth()+1).padStart(2,'0');
  const yy  = String(now.getFullYear()).slice(-2);
  return `Ihre Bestellung ${dd}.${mm}.${yy} HumanFit Matrix\u00A9 \u2014 BMB-Whitepaper Marktlogik \u00D7 Menschenlogik`;
}

// ── E-Mail-Template ──────────────────────────────────────────────────────────
function buildConfirmEmail({ vorname, nachname, position, unternehmen, newsletterJa, notifyJa }) {
  const kontext  = [position, unternehmen].filter(Boolean).join(' \u00B7 ');
  const fullName = `${vorname} ${nachname}`.trim();
  const items = ["HumanFit Matrix: 5 Realit\u00e4ten \u00d7 8 Bed\u00fcrfnisdimensionen",
    "Hotspot B2 \u00d7 D2/D3/D6/D8 \u2014 der aggressivste Cluster",
    "8 Fr\u00fchwarnsignale \u2014 konkret und sofort beobachtbar",
    "Maschinenbau-Case: 140 Agents, 6 Wochen, messbare Ergebnisse",
    "5 Selbstdiagnose-Fragen \u2014 f\u00fcr heute, nach diesem Lesen"];

  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#ECEEF2;font-family:${FONT};">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#ECEEF2;padding:32px 0 48px;">
<tr><td align="center">
<table width="620" cellpadding="0" cellspacing="0" style="max-width:620px;">

  <!-- HEADER -->
  <tr><td style="background:#0D1B3E;border-radius:6px 6px 0 0;padding:28px 40px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td>
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:2.5px;color:#E87425;text-transform:uppercase;font-family:${FONT};">BMB Deutschland GmbH</p>
        <h1 style="margin:0;font-size:23px;font-weight:700;color:#ffffff;line-height:1.3;font-family:${FONT};">
          HumanFit Matrix&#169;<br>
          <span style="font-size:14px;font-weight:400;color:#AABBDD;">Marktlogik &times; Menschenlogik</span>
        </h1>
      </td>
      <td width="80" style="text-align:right;vertical-align:middle;">
        <img src="data:image/png;base64,${BMB_LOGO}" width="64" alt="BMB" style="display:block;margin-left:auto;">
      </td>
    </tr></table>
  </td></tr>

  <tr><td style="background:#E87425;height:3px;line-height:3px;font-size:0;">&nbsp;</td></tr>

  <!-- BODY -->
  <tr><td style="background:#ffffff;padding:36px 40px 0;">
    <p style="margin:0 0 4px;font-size:18px;font-weight:700;color:#0D1B3E;font-family:${FONT};">Hallo ${fullName},</p>
    ${kontext ? `<p style="margin:0 0 24px;font-size:13px;color:#6B7280;font-family:${FONT};">${kontext}</p>` : `<p style="margin:0 0 24px;"></p>`}
    <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.75;font-family:${FONT};">
      vielen Dank f&uuml;r Ihr Interesse. Im Anhang dieser E-Mail finden Sie das vollst&auml;ndige Whitepaper:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D1B3E;border-radius:4px;margin:0 0 24px;">
      <tr><td style="padding:20px 24px;">
        <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:2px;color:#E87425;text-transform:uppercase;font-family:${FONT};">Ihr Whitepaper &mdash; Im Anhang</p>
        <p style="margin:0;font-size:17px;font-weight:700;color:#ffffff;line-height:1.4;font-family:${FONT};">Wenn Organisationen die falschen Fragen stellen</p>
        <p style="margin:5px 0 0;font-size:13px;color:#AABBDD;font-family:${FONT};">Ein Zwei-Ebenen-Modell f&uuml;r Entscheider in der Dauerkrise</p>
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-left:4px solid #E87425;background:#F7F8FA;border-radius:0 4px 4px 0;margin:0 0 28px;">
      <tr><td style="padding:18px 22px;">
        <p style="margin:0 0 12px;font-size:10px;font-weight:700;letter-spacing:2px;color:#0D1B3E;text-transform:uppercase;font-family:${FONT};">Was Sie erwartet</p>
        <table cellpadding="0" cellspacing="0" width="100%">
          ${items.map(item => `<tr>
            <td width="18" style="vertical-align:top;"><div style="width:7px;height:7px;background:#E87425;border-radius:50%;margin-top:6px;"></div></td>
            <td style="padding-bottom:9px;font-size:14px;color:#374151;line-height:1.5;font-family:${FONT};">${item}</td>
          </tr>`).join('')}
        </table>
      </td></tr>
    </table>
    <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;font-family:${FONT};">
      Wenn nach der Lekt&uuml;re Fragen entstehen oder Sie einen konkreten Fall besprechen m&ouml;chten:
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
      <tr>
        <td style="background:#E87425;border-radius:4px;padding:13px 28px;">
          <a href="https://meetings-eu1.hubspot.com/marc-bergmann" style="color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;font-family:${FONT};">Termin vereinbaren &rarr;</a>
        </td>
        <td width="10"></td>
        <td style="border:2px solid #0D1B3E;border-radius:4px;padding:11px 22px;">
          <a href="mailto:info@bmbdeutschland.de" style="color:#0D1B3E;font-size:14px;font-weight:700;text-decoration:none;font-family:${FONT};">Direkt schreiben</a>
        </td>
      </tr>
    </table>
    ${notifyJa ? `<table width="100%" cellpadding="0" cellspacing="0" style="background:#EEF1F8;border-radius:4px;margin:0 0 16px;"><tr><td style="padding:14px 20px;font-size:14px;color:#0D1B3E;line-height:1.6;font-family:${FONT};">&#128276;&nbsp; Sie werden benachrichtigt, sobald der <strong>HumanFit Check (SaaS)</strong> verf&uuml;gbar ist.</td></tr></table>` : ''}
    ${newsletterJa ? `<table width="100%" cellpadding="0" cellspacing="0" style="background:#EEF1F8;border-radius:4px;margin:0 0 16px;"><tr><td style="padding:14px 20px;font-size:14px;color:#0D1B3E;line-height:1.6;font-family:${FONT};">&#128236;&nbsp; Sie erhalten ab sofort unseren Newsletter. Abmeldung jederzeit m&ouml;glich.</td></tr></table>` : ''}
  </td></tr>

  <tr><td style="background:#ffffff;padding:0 40px;">
    <hr style="border:none;border-top:1px solid #E8E9EC;margin:4px 0 24px;">
  </td></tr>

  <!-- SIGNATUR -->
  <tr><td style="background:#ffffff;padding:0 40px 28px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="vertical-align:top;">
        <p style="margin:0 0 2px;font-size:15px;font-weight:700;color:#0D1B3E;font-family:${FONT};">Marc Bergmann</p>
        <p style="margin:0 0 12px;font-size:12px;color:#6B7280;line-height:1.5;font-family:${FONT};">Managing Director &amp;<br>Lehrbeauftragter der Heinrich-Heine-Universit&auml;t D&uuml;sseldorf</p>
        <p style="margin:0 0 2px;font-size:11px;font-weight:700;color:#0D1B3E;letter-spacing:1px;text-transform:uppercase;font-family:${FONT};">BMB Deutschland GmbH</p>
        <p style="margin:0 0 14px;font-size:12px;color:#6B7280;line-height:1.8;font-family:${FONT};">
          Mittelstra&szlig;e 23 // 40721 Hilden<br>
          Fon +49 (2103) 255 988&nbsp;&ndash;&nbsp;0 &nbsp;&middot;&nbsp; Mobil +49 (178) 777 222 9<br>
          <a href="mailto:marc.bergmann@bmbdeutschland.de" style="color:#E87425;text-decoration:none;">marc.bergmann@bmbdeutschland.de</a><br>
          <a href="https://www.bmbdeutschland.de" style="color:#E87425;text-decoration:none;">www.bmbdeutschland.de</a>
        </p>
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="background:#0A66C2;border-radius:3px;padding:7px 14px;">
            <a href="https://www.linkedin.com/in/marc-bergmann-631650143/" style="color:#ffffff;font-size:12px;font-weight:700;text-decoration:none;font-family:${FONT};">in &nbsp;LinkedIn-Profil</a>
          </td>
          <td width="8"></td>
          <td style="background:#F7F8FA;border:1px solid #E8E9EC;border-radius:3px;padding:6px 12px;">
            <a href="https://meetings-eu1.hubspot.com/marc-bergmann" style="color:#0D1B3E;font-size:12px;font-weight:700;text-decoration:none;font-family:${FONT};">&#128197; Termin buchen</a>
          </td>
        </tr></table>
      </td>
      <td width="115" style="vertical-align:top;text-align:center;padding-left:20px;">
        <p style="margin:0 0 6px;font-size:10px;color:#9CA3AF;text-align:center;text-transform:uppercase;letter-spacing:1px;font-family:${FONT};">LinkedIn</p>
        <div style="border:1px solid #E8E9EC;border-radius:4px;padding:5px;display:inline-block;background:#fff;">
          <img src="data:image/png;base64,${LINKEDIN_QR}" width="88" height="88" alt="LinkedIn QR" style="display:block;">
        </div>
        <p style="margin:5px 0 0;font-size:10px;color:#9CA3AF;text-align:center;font-family:${FONT};">Profil scannen</p>
      </td>
    </tr></table>
  </td></tr>

  <!-- BUSINESS PARTNER -->
  <tr><td style="background:#F7F8FA;border-top:1px solid #E8E9EC;padding:18px 40px;">
    <p style="margin:0 0 14px;font-size:10px;font-weight:700;letter-spacing:2px;color:#9CA3AF;text-transform:uppercase;font-family:${FONT};">Business-Partner &amp; Dienstleister 2025/2026</p>
    <img src="data:image/png;base64,${KOELN_LOGO}" width="52" height="52" alt="1. FC K&ouml;ln" style="display:block;">
  </td></tr>

  <!-- FOOTER -->
  <tr><td style="background:#0D1B3E;border-radius:0 0 6px 6px;padding:16px 40px;">
    <p style="margin:0;font-size:11px;color:#6B8AB8;line-height:1.7;font-family:${FONT};">
      Sie erhalten diese E-Mail auf Ihren Wunsch hin &mdash; Ihre Daten werden ausschlie&szlig;lich zur Zusendung
      dieses Whitepapers verwendet und nicht an Dritte weitergegeben. &nbsp;&middot;&nbsp;
      <a href="https://www.bmbdeutschland.de/datenschutz" style="color:#E87425;text-decoration:none;">Datenschutzerkl&auml;rung</a>
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    let body = req.body;
    if (!body || (typeof body === 'object' && Object.keys(body).length === 0)) {
      const rawBody = await new Promise((resolve, reject) => {
        let data = '';
        req.on('data', chunk => { data += chunk; });
        req.on('end', () => resolve(data));
        req.on('error', reject);
      });
      if (!rawBody || rawBody.trim() === '') {
        return res.status(400).json({ error: 'Leerer Request-Body' });
      }
      body = JSON.parse(rawBody);
    } else if (typeof body === 'string') {
      body = JSON.parse(body);
    }

    const {
      vorname, nachname, email, telefon,
      unternehmen, position, branche, groesse,
      nachricht, newsletter, notify_check
    } = body;

    if (!vorname || !nachname || !email || !unternehmen) {
      return res.status(400).json({ error: 'Pflichtfelder fehlen (vorname, nachname, email, unternehmen)' });
    }
    if (!telefon || String(telefon).trim().length < 6) {
      return res.status(400).json({ error: 'Pflichtfeld Telefon fehlt oder zu kurz' });
    }

    const newsletterJa  = newsletter   === 'ja';
    const notifyJa      = notify_check === 'ja';
    const newsletterTxt = newsletterJa ? 'Ja' : 'Nein';
    const notifyTxt     = notifyJa     ? 'Ja' : 'Nein';
    const listIds       = newsletterJa ? [2, 3] : [2];

    // 1. Brevo Kontakt
    const contactRes = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: { 'accept':'application/json','content-type':'application/json','api-key':process.env.BREVO_API_KEY },
      body: JSON.stringify({
        email: email.trim(),
        attributes: {
          VORNAME:vorname.trim(), NACHNAME:nachname.trim(), FIRMA:unternehmen.trim(),
          TELEFON:telefon.trim(), POSITION:position||'', BRANCHE:branche||'',
          GROESSE:groesse||'', HERAUSFORDERUNG:nachricht||'',
          NEWSLETTER:newsletterTxt, HUMANFIT_SAAS:notifyTxt
        },
        listIds, updateEnabled: true
      })
    });
    if (!contactRes.ok) {
      console.error('Brevo contact error:', contactRes.status, await contactRes.text());
    }

    // 2. Bestätigungsmail mit PDF
    const emailRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'accept':'application/json','content-type':'application/json','api-key':process.env.BREVO_API_KEY },
      body: JSON.stringify({
        sender:  { name:'Marc Bergmann \u00B7 BMB Deutschland', email:'info@bmbdeutschland.de' },
        to:      [{ email:email.trim(), name:`${vorname.trim()} ${nachname.trim()}` }],
        replyTo: { email:'info@bmbdeutschland.de', name:'Marc Bergmann' },
        subject: buildSubject(),
        attachment: [{ content:PDF_B64, name:'HumanFit_Whitepaper_Maerz_2026.pdf' }],
        htmlContent: buildConfirmEmail({
          vorname:vorname.trim(), nachname:nachname.trim(),
          position:position||'', unternehmen:unternehmen.trim(),
          newsletterJa, notifyJa
        })
      })
    });
    if (!emailRes.ok) {
      console.error('Brevo email error:', emailRes.status, await emailRes.text());
    }

    // 3. Interne Benachrichtigung
    const notifyRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'accept':'application/json','content-type':'application/json','api-key':process.env.BREVO_API_KEY },
      body: JSON.stringify({
        sender: { name:'BMB Website', email:'info@bmbdeutschland.de' },
        to:     [{ email:'info@bmbdeutschland.de', name:'BMB Deutschland' }],
        subject: `\uD83D\uDD14 Neuer Whitepaper-Download: ${vorname.trim()} ${nachname.trim()} \u2013 ${unternehmen.trim()}`,
        htmlContent: `<div style="font-family:sans-serif;padding:24px;max-width:560px;">
          <h2 style="color:#1a3b55;border-bottom:2px solid #e87425;padding-bottom:10px;margin-bottom:18px;">Neuer Whitepaper-Download</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr><td style="padding:7px 0;color:#7a8d9e;width:160px;"><strong>Name</strong></td><td>${vorname.trim()} ${nachname.trim()}</td></tr>
            <tr><td style="padding:7px 0;color:#7a8d9e;"><strong>E-Mail</strong></td><td><a href="mailto:${email.trim()}" style="color:#e87425;">${email.trim()}</a></td></tr>
            <tr><td style="padding:7px 0;color:#7a8d9e;"><strong>Telefon</strong></td><td>${telefon||'\u2013'}</td></tr>
            <tr><td style="padding:7px 0;color:#7a8d9e;"><strong>Unternehmen</strong></td><td>${unternehmen.trim()}</td></tr>
            <tr><td style="padding:7px 0;color:#7a8d9e;"><strong>Position</strong></td><td>${position||'\u2013'}</td></tr>
            <tr><td style="padding:7px 0;color:#7a8d9e;"><strong>Branche</strong></td><td>${branche||'\u2013'}</td></tr>
            <tr><td style="padding:7px 0;color:#7a8d9e;"><strong>Teamgr\u00f6\u00dfe</strong></td><td>${groesse||'\u2013'}</td></tr>
            <tr><td style="padding:7px 0;color:#7a8d9e;"><strong>Herausforderung</strong></td><td>${nachricht||'\u2013'}</td></tr>
          </table>
          <hr style="border:none;border-top:1px solid #edf0f4;margin:14px 0;">
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr><td style="padding:6px 0;color:#7a8d9e;width:160px;"><strong>Newsletter</strong></td><td style="font-weight:700;color:${newsletterJa?'#27ae60':'#c0392b'};">${newsletterTxt}</td></tr>
            <tr><td style="padding:6px 0;color:#7a8d9e;"><strong>HumanFit SaaS</strong></td><td style="font-weight:700;color:${notifyJa?'#27ae60':'#c0392b'};">${notifyTxt}</td></tr>
          </table>
        </div>`
      })
    });
    if (!notifyRes.ok) {
      console.error('Brevo notify error (non-critical):', notifyRes.status, await notifyRes.text());
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Interner Serverfehler: ' + error.message });
  }
};
