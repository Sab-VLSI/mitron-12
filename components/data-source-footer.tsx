import { ExternalLink } from "lucide-react"
import { DATA_SOURCES, getLastUpdated } from "@/lib/data-sources"

interface DataSourceFooterProps {
  sources: string[]
  category: keyof typeof DATA_SOURCES
}

export function DataSourceFooter({ sources, category }: DataSourceFooterProps) {
  const categoryData = DATA_SOURCES[category]

  return (
    <div className="mt-8 p-4 bg-muted/50 rounded-lg border">
      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
        <ExternalLink className="h-4 w-4" />
        Data Sources & References
      </h4>
      <div className="space-y-2 text-xs text-muted-foreground">
        {sources.map((sourceKey) => {
          const source = categoryData[sourceKey as keyof typeof categoryData]
          if (!source) return null

          return (
            <div key={sourceKey} className="flex flex-col gap-1">
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                {source.name}
              </a>
              <p className="text-xs">{source.description}</p>
            </div>
          )
        })}
        <div className="pt-2 border-t border-border/50">
          <p className="text-xs">Last updated: {getLastUpdated()}</p>
          <p className="text-xs">Data refreshed daily from official government sources</p>
        </div>
      </div>
    </div>
  )
}
