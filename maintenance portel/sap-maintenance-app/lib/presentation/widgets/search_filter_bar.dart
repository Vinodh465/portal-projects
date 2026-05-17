import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

/// Search bar + filter row used on every list screen
class SearchFilterBar extends StatelessWidget {
  final TextEditingController searchController;
  final String searchHint;
  final VoidCallback onSearch;
  final VoidCallback onClear;

  const SearchFilterBar({
    super.key,
    required this.searchController,
    required this.onSearch,
    required this.onClear,
    this.searchHint = 'Search...',
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: TextField(
            controller: searchController,
            onSubmitted: (_) => onSearch(),
            decoration: InputDecoration(
              hintText: searchHint,
              prefixIcon: const Icon(Icons.search, size: 20),
              suffixIcon: searchController.text.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear, size: 18),
                      onPressed: () {
                        searchController.clear();
                        onClear();
                      },
                    )
                  : null,
            ),
            style: const TextStyle(fontSize: 14),
          ),
        ),
        const SizedBox(width: 8),
        ElevatedButton.icon(
          onPressed: onSearch,
          icon: const Icon(Icons.filter_list, size: 18),
          label: const Text('Apply'),
          style: ElevatedButton.styleFrom(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          ),
        ),
      ],
    );
  }
}
