package main

import (
	"encoding/csv"
	"log"
	"os"

	"github.com/gocolly/colly"
)

func main() {
	fName := "data.csv"
	file, err := os.Create(fName)
	if err != nil {
		log.Fatalf("Cannot create file %q: %s\n", fName, err)
		return
	}
	defer file.Close()
	writer := csv.NewWriter(file)
	defer writer.Flush()

	c := colly.NewCollector()

	c.OnHTML("div.s-result-list", func(el *colly.HTMLElement) {
		el.ForEach("div.a-section.a-spacing-small.a-spacing-top-small", func(_ int, r *colly.HTMLElement) {
			price := r.ChildText("span.a-price-whole")
			title := r.ChildText("span.a-size-medium.a-color-base.a-text-normal")
			link := "https://www.amazon.com/" + r.ChildAttr("a.a-link-normal.s-underline-text.s-underline-link-text.s-link-style.a-text-normal", "href")
			writer.Write([]string{
				title,
				price,
				link,
			})
		})
	})

	c.Visit("https://www.amazon.com/s?k=mechanical+keyboard+wireless+60+percent&sprefix=mechanical+keyboard+wireless")

	log.Printf("Scraping finished, check file %q for results\n", fName)
}
